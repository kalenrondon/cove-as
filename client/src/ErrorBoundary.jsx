import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <p className="text-3xl mb-2">⚠️</p>
          <h2 className="font-bold text-lg text-red-500 mb-2">Algo salió mal</h2>
          <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm">
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
