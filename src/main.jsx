import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, background: '#fef2f2', minHeight: '100vh' }}>
          <h1 style={{ color: '#dc2626', fontSize: 24 }}>Erreur fatale</h1>
          <pre style={{ color: '#991b1b', whiteSpace: 'pre-wrap', marginTop: 16 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ color: '#b91c1c', whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 12 }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{ marginTop: 16, padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Recharger
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
