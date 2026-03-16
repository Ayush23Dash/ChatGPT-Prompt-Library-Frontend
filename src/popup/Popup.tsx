import React from 'react'
import { createRoot } from 'react-dom/client'

function Popup() {
  function openChatGPT() {
    chrome.tabs.create({ url: 'https://chatgpt.com' })
  }

  return (
    <div style={{ width: 260, padding: '16px', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, background: '#16a34a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: 14 }}>P</span>
        </div>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Prompt Library</span>
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, margin: '0 0 12px' }}>
        A sidebar is injected into ChatGPT where you can save, organize, and insert prompts with variable substitution.
      </p>
      <ul style={{ fontSize: 12, color: '#374151', paddingLeft: 16, margin: '0 0 14px', lineHeight: 1.8 }}>
        <li>Create folders to organize prompts</li>
        <li>Click <strong>+ Save</strong> to save the current prompt</li>
        <li>Click <strong>Insert</strong> to fill the textarea</li>
        <li>Use <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{'{variable}'}</code> for substitution</li>
      </ul>
      <button
        onClick={openChatGPT}
        style={{
          width: '100%', padding: '8px', background: '#16a34a', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        Open ChatGPT →
      </button>
    </div>
  )
}

const root = createRoot(document.getElementById('popup-root')!)
root.render(<Popup />)
