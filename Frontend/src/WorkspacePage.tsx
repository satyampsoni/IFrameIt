import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
  Button,
  CssBaseline,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import MonacoEditor from '@monaco-editor/react';
import AnimatedBackground from './AnimatedBackground';
import VisibilityIcon from '@mui/icons-material/Visibility';
import JSZip from 'jszip';
import ChatPanel from './ChatPanel';

// Helper: recursively assign unique IDs to files/folders for TreeView
function assignIds(nodes: any[], parentId = 'root'): any[] {
  let idCounter = 0;
  function walk(node: any, parent: string): any {
    const id = `${parent}-${idCounter++}`;
    if (node.type === 'folder' && Array.isArray(node.children)) {
      return { ...node, id, children: node.children.map(child => walk(child, id)) };
    }
    return { ...node, id };
  }
  return nodes.map(n => walk(n, parentId));
}

// Default: empty structure
const initialFiles: any[] = [];

function renderTree(nodes: any, onSelect: (file: any) => void) {
  return (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {nodes.type === 'folder' ? <FolderIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />}
          <Typography
            sx={{ cursor: nodes.type === 'file' ? 'pointer' : 'default', fontWeight: nodes.type === 'file' ? 500 : 400 }}
            onClick={() => nodes.type === 'file' && onSelect(nodes)}
            color={nodes.type === 'file' ? 'primary' : 'text.secondary'}
          >
            {nodes.name}
          </Typography>
        </Box>
      }
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((child: any) => renderTree(child, onSelect))
        : null}
    </TreeItem>
  );
}

// Add files to zip
function addFilesToZip(zip: any, nodes: any[], parentPath = '') {
  nodes.forEach((node: any) => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === 'file') {
      zip.file(currentPath, node.content || '');
    } else if (node.type === 'folder' && Array.isArray(node.children)) {
      addFilesToZip(zip, node.children, currentPath);
    }
  });
}

import { useParams } from 'react-router-dom';

const WorkspacePage = () => {
  console.log("WorkspacePage component rendered");
  const location = useLocation();
  const { id: workspaceId } = useParams();
  // Debug: log location.state, workspaceId, and localStorage
  console.log('WorkspacePage: location.state', location.state);
  console.log('WorkspacePage: workspaceId', workspaceId);
  const stored = workspaceId ? localStorage.getItem(`workspace_files_${workspaceId}`) : null;
  console.log('WorkspacePage: localStorage files', stored);

  // File explorer state
  const [files, setFiles] = useState<any[]>(() => {
    // If files are passed from navigation (LandingPage), use them
    if (location.state && location.state.files) {
      return assignIds(location.state.files);
    }
    // Try to load from localStorage
    if (workspaceId) {
      const stored = localStorage.getItem(`workspace_files_${workspaceId}`);
      if (stored) return assignIds(JSON.parse(stored));
    }
    return initialFiles;
  });

  // On mount or workspaceId change, if files are empty, try to load from localStorage
  React.useEffect(() => {
    if ((!files || files.length === 0) && workspaceId) {
      const stored = localStorage.getItem(`workspace_files_${workspaceId}`);
      if (stored) {
        const loadedFiles = assignIds(JSON.parse(stored));
        setFiles(loadedFiles);
        // Select first file (DFS)
        function findFirstFile(nodes: any[]): any {
          for (const n of nodes) {
            if (n.type === 'file') return n;
            if (n.type === 'folder' && n.children) {
              const f = findFirstFile(n.children);
              if (f) return f;
            }
          }
          return null;
        }
        const first = findFirstFile(loadedFiles);
        setSelectedFile(first);
        setCode(first?.content || '');
      }
    }
  }, [workspaceId]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [code, setCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Sync with navigation state (for when navigating from LandingPage)
  React.useEffect(() => {
    if (location.state && location.state.files) {
      const withIds = assignIds(location.state.files);
      setFiles(withIds);
      // Select first file (DFS)
      function findFirstFile(nodes: any[]): any {
        for (const n of nodes) {
          if (n.type === 'file') return n;
          if (n.type === 'folder' && n.children) {
            const f = findFirstFile(n.children);
            if (f) return f;
          }
        }
        return null;
      }
      const first = findFirstFile(withIds);
      setSelectedFile(first);
      setCode(first?.content || '');
    }
  }, [location.state]);

  // Update code editor when file changes
  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setCode(file.content);
    setShowPreview(false);
  };

  // Save code to file (in-memory for now)
  const handleCodeChange = (value: string | undefined) => {
    setCode(value ?? '');
    if (selectedFile) selectedFile.content = value;
  };

  // Download code as zip
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    addFilesToZip(zip, files);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.zip';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Find the main HTML file for preview (index.html or App.js rendered as HTML)
  function findPreviewFile(nodes: any[]): any {
    for (const n of nodes) {
      if (n.type === 'file' && (n.name === 'index.html' || n.name === 'App.js' || n.name === 'App.tsx')) return n;
      if (n.type === 'folder' && n.children) {
        const f = findPreviewFile(n.children);
        if (f) return f;
      }
    }
    return null;
  }
  const previewFile = findPreviewFile(files);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      <CssBaseline />
      {/* 50% Streaming Response | 50% File Explorer + Editor or Preview */}
      {/* Left: Streaming Response */}
      <Box sx={{ width: '50%', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #23262f', bgcolor: '#20232f', zIndex: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #23262f' }}>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Streaming Response
          </Typography>
        </Box>
        <Box sx={{ p: 2, flex: 1, overflowY: 'auto', fontFamily: 'Fira Mono, monospace', fontSize: 15, color: '#90caf9' }}>
          {/* TODO: Connect to backend streaming output */}
          <Typography variant="body2" color="text.secondary">
            (Streaming LLM/code output will appear here)
          </Typography>
        </Box>
      </Box>
      {/* Right: File Explorer + Editor OR Preview */}
      <Box sx={{ width: '50%', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {showPreview ? (
          // --- Preview Mode ---
          <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #23262f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
            {console.log('IDs in files:', files.map(f => f.id))}
              <TreeView
                defaultCollapseIcon={<FolderIcon />}
                defaultExpandIcon={<FolderIcon />}
                sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 300 }}
                defaultExpanded={['root']}
              >
                {renderTree({ id: 'root', name: 'root', type: 'folder', children: files }, handleFileSelect)}
              </TreeView>
            </Box>
          </Box>
        ) : (
          // --- Editor Mode ---
          <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #23262f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
            {console.log('IDs in files:', files.map(f => f.id))}
            <TreeView
              defaultCollapseIcon={<FolderIcon />}
              defaultExpandIcon={<FolderIcon />}
              sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 300 }}
              defaultExpanded={['root']}
            >
              {renderTree({ id: 'root', name: 'root', type: 'folder', children: files }, handleFileSelect)}
            </TreeView>
            </Box>
          </Box>
        )}
        {/* Main Area: Code Editor + Preview */}
        <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', bgcolor: 'background.paper', borderRight: '1px solid #23262f', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              px: 2,
              py: 2,
              borderBottom: '1px solid #23262f',
              bgcolor: 'background.paper',
              gap: 2,
              minHeight: 56,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              sx={{ fontWeight: 600, mr: 2, minWidth: 140 }}
              onClick={handleDownloadZip}
            >
              Download ZIP
            </Button>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary.main"
              sx={{
                wordBreak: 'break-all',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 320,
                flex: 1,
              }}
            >
              {selectedFile?.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => setShowPreview(true)}
              sx={{ fontWeight: 700, minWidth: 120, boxShadow: 2, py: 1.1 }}
              disabled={!previewFile}
              title={!previewFile ? 'No previewable file found' : 'Preview main app'}
            >
              Preview
            </Button>
          </Box>
          <Divider />
          <Box sx={{ flex: 1, minHeight: 0, borderRadius: 2, overflow: 'hidden', boxShadow: 0, display: 'flex', flexDirection: 'row' }}>
            {/* Code Editor */}
            <Box sx={{ flex: 2, minWidth: 0, height: '100%' }}>
              <MonacoEditor
                height="100%"
                width="100%"
                language={selectedFile?.name?.endsWith('.js') ? 'javascript' : selectedFile?.name?.endsWith('.css') ? 'css' : 'html'}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{ fontSize: 16, minimap: { enabled: false }, fontFamily: 'Fira Mono, monospace', theme: 'vs-dark' }}
              />
            </Box>
            {/* Live Preview */}
            <Box sx={{ flex: 3, bgcolor: '#15171c', borderLeft: '1px solid #23262f', minWidth: 0, height: '100%', display: showPreview && previewFile ? 'block' : 'none' }}>
              {showPreview && previewFile && previewFile.type === 'file' && (
                previewFile.name.endsWith('.html') ? (
                  <iframe
                    srcDoc={previewFile.content}
                    style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    title="Live Preview"
                  />
                ) : (
                  <Box sx={{ p: 2, color: 'text.secondary' }}>
                    Preview is only available for HTML files.
                  </Box>
                )
              )}
            </Box>
          </Box>
        </Box>
        {/* Chat Assistant */}
        <Box sx={{ width: 340, minWidth: 260, maxWidth: 400, height: '100%', borderLeft: '1px solid #23262f', bgcolor: 'background.paper', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', zIndex: 3 }}>
          <ChatPanel />
        </Box>
      </Box>
    </Box>
  );
}

export default WorkspacePage;
