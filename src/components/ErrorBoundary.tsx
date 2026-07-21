import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled error while rendering page:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 px-6 py-20 text-center">
          <p className="text-sm font-medium text-red-700">화면을 불러오는 중 문제가 발생했어요</p>
          <p className="mt-1 max-w-md text-sm text-red-600">{this.state.error.message}</p>
          <p className="mt-4 text-sm text-slate-500">왼쪽 메뉴에서 다른 화면으로 이동할 수 있어요.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
