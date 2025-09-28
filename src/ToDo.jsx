import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  Tooltip,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CategoryIcon from "@mui/icons-material/Category";

// --- Helpers ---
const STORAGE_KEY = "todo.tasks.v1";
const defaultCategories = ["All", "Personal", "Work", "Errands", "Study"];

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore quota errors
    }
  }, [key, value]);
  return [value, setValue];
}

// --- Theme ---
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
  shape: { borderRadius: 12 },
});

// --- Task Types ---
// { id, title, notes, category, completed, createdAt, due }

// --- Components ---
function Header({ incompleteCount }) {
  return (
    <AppBar position="sticky" elevation={0} sx={{ mb: 2 }}>
      <Toolbar>
        <CategoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          To‑Do List Manager
        </Typography>
        <Tooltip title="Tasks remaining">
          <Badge color="secondary" badgeContent={incompleteCount} showZero>
            <Typography variant="body2">Open</Typography>
          </Badge>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

function CategoryTabs({ categories, current, onChange }) {
  return (
    <Paper sx={{ mb: 2 }}>
      <Tabs
        value={current}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {categories.map((c) => (
          <Tab key={c} label={c} value={c} />
        ))}
      </Tabs>
    </Paper>
  );
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
    >
      <IconButton color={task.completed ? "success" : "default"} onClick={() => onToggle(task.id)}>
        {task.completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
      </IconButton>
      <Box sx={{ flexGrow: 1, opacity: task.completed ? 0.6 : 1 }}>
        <Typography variant="subtitle1" sx={{ textDecoration: task.completed ? "line-through" : "none" }}>
          {task.title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
          <Chip size="small" label={task.category} />
          {task.due && (
            <Chip size="small" variant="outlined" label={`Due: ${new Date(task.due).toLocaleDateString()}`} />
          )}
        </Stack>
        {task.notes && (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
            {task.notes}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        <Tooltip title="Edit">
          <IconButton color="primary" onClick={() => onEdit(task)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => onDelete(task.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body1">هیچ کاری برای نمایش وجود ندارد.</Typography>
      </Paper>
    );
  }
  return (
    <Stack spacing={1.5}>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)
      )}
    </Stack>
  );
}

function TaskEditor({ open, onClose, onSave, initial }) {
  const isEdit = Boolean(initial?.id);
  const [title, setTitle] = useState(initial?.title || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [category, setCategory] = useState(initial?.category || "Personal");
  const [due, setDue] = useState(initial?.due ? initial.due.substring(0, 10) : "");
  const [completed, setCompleted] = useState(Boolean(initial?.completed));

  useEffect(() => {
    setTitle(initial?.title || "");
    setNotes(initial?.notes || "");
    setCategory(initial?.category || "Personal");
    setDue(initial?.due ? initial.due.substring(0, 10) : "");
    setCompleted(Boolean(initial?.completed));
  }, [initial]);

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    const base = {
      id: initial?.id || uid(),
      title: title.trim(),
      notes: notes.trim(),
      category,
      due: due ? new Date(due).toISOString() : "",
      completed,
      createdAt: initial?.createdAt || new Date().toISOString(),
    };
    onSave(base);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "ویرایش کار" : "افزودن کار جدید"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="عنوان"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
            fullWidth
          />
          <TextField
            label="توضیحات"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="cat-label">دسته‌بندی</InputLabel>
            <Select
              labelId="cat-label"
              label="دسته‌بندی"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {defaultCategories.filter((c) => c !== "All").map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="موعد"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          {isEdit && (
            <FormControlLabel
              control={<Checkbox checked={completed} onChange={(e) => setCompleted(e.target.checked)} />}
              label="تکمیل شده"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StatsBar({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const open = total - done;
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
        <Typography>مجموع کارها: {total}</Typography>
        <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
        <Typography>تکمیل شده: {done}</Typography>
        <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
        <Typography>باز: {open}</Typography>
      </Stack>
    </Paper>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEY, []);
  const [category, setCategory] = useState("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filtered = useMemo(() => {
    return category === "All" ? tasks : tasks.filter((t) => t.category === category);
  }, [tasks, category]);

  const incompleteCount = tasks.filter((t) => !t.completed).length;

  const addTask = useCallback(() => {
    setEditingTask(null);
    setEditorOpen(true);
  }, []);

  const saveTask = (task) => {
    setTasks((prev) => {
      const exists = prev.some((p) => p.id === task.id);
      if (exists) {
        return prev.map((p) => (p.id === task.id ? { ...p, ...task } : p));
      }
      return [{ ...task }, ...prev];
    });
    setEditorOpen(false);
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const editTask = (task) => {
    setEditingTask(task);
    setEditorOpen(true);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: (t) => t.palette.grey[100] }}>
        <Header incompleteCount={incompleteCount} />
        <Container sx={{ py: 3 }}>
          <StatsBar tasks={tasks} />
          <CategoryTabs
            categories={defaultCategories}
            current={category}
            onChange={setCategory}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={addTask}>
              کار جدید
            </Button>
          </Box>

          <TaskList tasks={filtered} onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} />
        </Container>

        <TaskEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          onSave={saveTask}
          initial={editingTask}
        />
      </Box>
    </ThemeProvider>
  );
}
