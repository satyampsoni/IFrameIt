import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) throw new Error('Failed to get reply');
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant' as const, content: data.reply }]);
    } catch (err: any) {
      setError(err?.message || 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
        Chat with Assistant
      </Typography>
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, bgcolor: '#1a1d24', borderRadius: 2, p: 2, minHeight: 180 }}>
        {messages.length === 0 && (
          <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
        )}
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ mb: 1.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <Typography variant="body2" color={msg.role === 'user' ? 'primary' : 'secondary'} fontWeight={msg.role === 'user' ? 600 : 500}>
              {msg.role === 'user' ? 'You' : 'Assistant'}:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} /> <Typography variant="body2">Assistant is typing...</Typography>
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
        )}
      </Box>
      <Box component="form" onSubmit={e => { e.preventDefault(); sendMessage(); }} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          size="small"
          fullWidth
          disabled={loading}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading || !input.trim()}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatPanel;
