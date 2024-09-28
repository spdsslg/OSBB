import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Обновление состояния для следующего рендера с ошибкой
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Вывод ошибки в консоль
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Можно отобразить запасной UI или сообщение об ошибке
      return (
        <div>
          <h1>Что-то пошло не так.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
