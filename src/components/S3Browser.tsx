import { Component, createSignal, For, Show, onMount } from "solid-js";
import Box from "@suid/material/Box";
import AppBar from "@suid/material/AppBar";
import Toolbar from "@suid/material/Toolbar";
import Typography from "@suid/material/Typography";
import IconButton from "@suid/material/IconButton";
import List from "@suid/material/List";
import ListItem from "@suid/material/ListItem";
import ListItemButton from "@suid/material/ListItemButton";
import ListItemIcon from "@suid/material/ListItemIcon";
import ListItemText from "@suid/material/ListItemText";
import Divider from "@suid/material/Divider";
import Button from "@suid/material/Button";
import Dialog from "@suid/material/Dialog";
import DialogTitle from "@suid/material/DialogTitle";
import DialogContent from "@suid/material/DialogContent";
import DialogContentText from "@suid/material/DialogContentText";
import DialogActions from "@suid/material/DialogActions";
import TextField from "@suid/material/TextField";
import CircularProgress from "@suid/material/CircularProgress";
import Alert from "@suid/material/Alert";
import Fab from "@suid/material/Fab";
import FolderIcon from "@suid/icons-material/Folder";
import InsertDriveFileIcon from "@suid/icons-material/InsertDriveFile";
import ArrowBackIcon from "@suid/icons-material/ArrowBack";
import DeleteIcon from "@suid/icons-material/Delete";
import DriveFileMoveIcon from "@suid/icons-material/DriveFileMove";
import UploadFileIcon from "@suid/icons-material/UploadFile";
import DownloadIcon from "@suid/icons-material/Download";
import SettingsIcon from "@suid/icons-material/Settings";
import RefreshIcon from "@suid/icons-material/Refresh";
import ChevronRightIcon from "@suid/icons-material/ChevronRight";
import ChevronLeftIcon from "@suid/icons-material/ChevronLeft";
import type { AwsCredentials } from "../store/credentials";
import { clearCredentials } from "../store/credentials";
import {
  listObjects,
  uploadFile,
  deleteObject,
  moveObject,
  getDownloadUrl,
  type S3Item,
} from "../services/s3";

interface Props {
  credentials: AwsCredentials;
}

function getErrorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

const S3Browser: Component<Props> = (props) => {
  const [prefix, setPrefix] = createSignal("");
  const [items, setItems] = createSignal<S3Item[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = createSignal<S3Item | null>(null);
  const [deleting, setDeleting] = createSignal(false);

  // Move dialog
  const [moveTarget, setMoveTarget] = createSignal<S3Item | null>(null);
  const [moveFileName, setMoveFileName] = createSignal("");
  const [moveBrowserPrefix, setMoveBrowserPrefix] = createSignal("");
  const [selectedMoveFolder, setSelectedMoveFolder] = createSignal("");
  const [moveFolders, setMoveFolders] = createSignal<S3Item[]>([]);
  const [moveFoldersLoading, setMoveFoldersLoading] = createSignal(false);
  const [moving, setMoving] = createSignal(false);

  // Upload
  let fileInputRef: HTMLInputElement | undefined;
  const [uploading, setUploading] = createSignal(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listObjects(props.credentials, prefix());
      setItems(result);
    } catch (e) {
      setError(getErrorMessage(e, "Error al listar los archivos."));
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  onMount(refresh);

  const navigateInto = (folder: S3Item) => {
    setPrefix(folder.key);
    refresh();
  };

  const navigateUp = () => {
    const parts = prefix().replace(/\/$/, "").split("/");
    parts.pop();
    setPrefix(parts.length > 0 ? parts.join("/") + "/" : "");
    refresh();
  };

  const handleDelete = async () => {
    const target = deleteTarget();
    if (!target || target.isFolder) return;
    setDeleting(true);
    try {
      await deleteObject(props.credentials, target.key);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      setError(getErrorMessage(e, "Error al eliminar el archivo."));
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async () => {
    const target = moveTarget();
    const fileName = moveFileName().trim();
    const destinationFolder = selectedMoveFolder();
    if (!target || !fileName) return;
    const destinationKey = `${destinationFolder}${fileName}`;
    setMoving(true);
    try {
      await moveObject(props.credentials, target.key, destinationKey);
      setMoveTarget(null);
      setMoveFileName("");
      setMoveBrowserPrefix("");
      setSelectedMoveFolder("");
      setMoveFolders([]);
      await refresh();
    } catch (e) {
      setError(getErrorMessage(e, "Error al mover el archivo."));
    } finally {
      setMoving(false);
    }
  };

  const handleDownload = async (item: S3Item) => {
    try {
      const url = await getDownloadUrl(props.credentials, item.key);
      window.open(url, "_blank");
    } catch (e) {
      setError(getErrorMessage(e, "Error al generar enlace de descarga."));
    }
  };

  const handleUploadChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadFile(props.credentials, prefix(), file);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Error al subir el archivo."));
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const displayName = (item: S3Item) => {
    const key = item.isFolder ? item.key.replace(/\/$/, "") : item.key;
    return key.substring(prefix().length) || key;
  };

  const getFileName = (key: string): string => {
    const cleanKey = key.replace(/\/$/, "");
    const parts = cleanKey.split("/");
    return parts[parts.length - 1] || cleanKey;
  };

  const getParentPrefix = (key: string): string => {
    const cleanKey = key.replace(/\/$/, "");
    const parts = cleanKey.split("/");
    parts.pop();
    return parts.length > 0 ? `${parts.join("/")}/` : "";
  };

  const loadMoveFolders = async (folderPrefix: string) => {
    setMoveFoldersLoading(true);
    try {
      const result = await listObjects(props.credentials, folderPrefix);
      setMoveFolders(result.filter((item) => item.isFolder));
    } catch (e) {
      setError(getErrorMessage(e, "Error al cargar carpetas para mover."));
    } finally {
      setMoveFoldersLoading(false);
    }
  };

  const openMoveDialog = (item: S3Item) => {
    const parentPrefix = getParentPrefix(item.key);
    setMoveTarget(item);
    setMoveFileName(getFileName(item.key));
    setMoveBrowserPrefix(parentPrefix);
    setSelectedMoveFolder(parentPrefix);
    void loadMoveFolders(parentPrefix);
  };

  const closeMoveDialog = () => {
    setMoveTarget(null);
    setMoveFileName("");
    setMoveBrowserPrefix("");
    setSelectedMoveFolder("");
    setMoveFolders([]);
  };

  const enterMoveFolder = (folder: S3Item) => {
    setMoveBrowserPrefix(folder.key);
    setSelectedMoveFolder(folder.key);
    void loadMoveFolders(folder.key);
  };

  const moveBrowseUp = () => {
    const parts = moveBrowserPrefix().replace(/\/$/, "").split("/");
    parts.pop();
    const parentPrefix = parts.length > 0 ? `${parts.join("/")}/` : "";
    setMoveBrowserPrefix(parentPrefix);
    setSelectedMoveFolder(parentPrefix);
    void loadMoveFolders(parentPrefix);
  };

  const getRelativeFolderName = (item: S3Item): string => {
    const withoutSlash = item.key.replace(/\/$/, "");
    const currentPrefix = moveBrowserPrefix();
    const relative = withoutSlash.substring(currentPrefix.length);
    return relative || withoutSlash;
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatSecondaryText = (item: S3Item): string | undefined => {
    if (item.isFolder) return undefined;
    const size = formatSize(item.size);
    const date = item.lastModified
      ? ` · ${item.lastModified.toLocaleDateString()}`
      : "";
    return `${size}${date}`;
  };

  return (
    <Box sx={{ pb: 8 }}>
      <AppBar position="sticky">
        <Toolbar>
          <Show when={prefix()}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={navigateUp}
              aria-label="Atrás"
            >
              <ArrowBackIcon />
            </IconButton>
          </Show>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }} noWrap>
            {prefix() ? `/${prefix()}` : props.credentials.bucket}
          </Typography>
          <IconButton color="inherit" onClick={refresh} aria-label="Actualizar">
            <RefreshIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={clearCredentials}
            aria-label="Configuración"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Show when={error()}>
        <Alert severity="error" onClose={() => setError("")} sx={{ m: 1 }}>
          {error()}
        </Alert>
      </Show>

      <Show when={loading()}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Show>

      <Show when={!loading()}>
        <Show
          when={items().length > 0}
          fallback={
            <Typography
              sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
            >
              Esta carpeta está vacía.
            </Typography>
          }
        >
          <List disablePadding>
            <For each={items()}>
              {(item) => (
                <>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <Box>
                        <Show when={!item.isFolder}>
                          <IconButton
                            edge="end"
                            aria-label="descargar"
                            onClick={() => handleDownload(item)}
                            size="small"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="mover"
                            onClick={() => openMoveDialog(item)}
                            size="small"
                          >
                            <DriveFileMoveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="eliminar"
                            onClick={() => setDeleteTarget(item)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Show>
                      </Box>
                    }
                  >
                    <ListItemButton
                      onClick={() => item.isFolder && navigateInto(item)}
                      sx={{ cursor: item.isFolder ? "pointer" : "default" }}
                    >
                      <ListItemIcon>
                        <Show
                          when={item.isFolder}
                          fallback={<InsertDriveFileIcon />}
                        >
                          <FolderIcon color="primary" />
                        </Show>
                      </ListItemIcon>
                      <ListItemText
                        primary={displayName(item)}
                        secondary={formatSecondaryText(item)}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </>
              )}
            </For>
          </List>
        </Show>
      </Show>

      {/* Upload FAB */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleUploadChange}
      />
      <Fab
        color="primary"
        aria-label={uploading() ? "Subiendo…" : "Subir archivo"}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => !uploading() && fileInputRef?.click()}
        disabled={uploading()}
      >
        <Show when={uploading()} fallback={<UploadFileIcon />}>
          <CircularProgress size={24} color="inherit" />
        </Show>
      </Fab>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget()} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar <strong>{deleteTarget()?.key}</strong>? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting()}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={deleting()}
            variant="contained"
          >
            {deleting() ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move dialog */}
      <Dialog
        open={!!moveTarget()}
        onClose={closeMoveDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Mover / Renombrar archivo</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del archivo"
            value={moveFileName()}
            onChange={(e) => setMoveFileName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1, mb: 2 }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <IconButton
              onClick={moveBrowseUp}
              disabled={moveFoldersLoading() || !moveBrowserPrefix()}
              size="small"
              aria-label="Subir carpeta"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                width: 32,
                height: 32,
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ mb: 1 }}>
            Seleccionada:{" "}
            {selectedMoveFolder() ? `/${selectedMoveFolder()}` : "/"}
          </Typography>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            <Show when={moveFoldersLoading()}>
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            </Show>

            <Show
              when={!moveFoldersLoading() && moveFolders().length > 0}
              fallback={
                <Typography
                  variant="body2"
                  sx={{ p: 2, color: "text.secondary", textAlign: "center" }}
                >
                  No hay subcarpetas en este nivel.
                </Typography>
              }
            >
              <List disablePadding>
                <For each={moveFolders()}>
                  {(folder) => (
                    <>
                      <ListItem
                        secondaryAction={
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => enterMoveFolder(folder)}
                              aria-label="Entrar carpeta"
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                width: 32,
                                height: 32,
                              }}
                            >
                              <ChevronRightIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon>
                          <FolderIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={getRelativeFolderName(folder)} />
                      </ListItem>
                      <Divider component="li" />
                    </>
                  )}
                </For>
              </List>
            </Show>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMoveDialog} disabled={moving()}>
            Cancelar
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              moving() ||
              !moveFileName().trim() ||
              !moveTarget() ||
              `${selectedMoveFolder()}${moveFileName().trim()}` ===
                moveTarget()?.key
            }
            variant="contained"
          >
            {moving() ? "Moviendo…" : "Mover"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default S3Browser;
