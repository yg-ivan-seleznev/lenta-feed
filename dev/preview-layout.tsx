import { Component, type ComponentChildren } from 'preact';
import './preview-layout.css';

interface IPreviewLayoutProps {
    children: ComponentChildren;
    description?: string;
    title: string;
}

interface IPreviewLayoutState {
    error: Error | null;
    hasError: boolean;
}

/**
 * PreviewLayout with ErrorBoundary
 * 
 * IMPORTANT: ErrorBoundary requires class component!
 * In Preact/React there's no hook for componentDidCatch - only class component can catch errors from child components.
 */
export class PreviewLayout extends Component<IPreviewLayoutProps, IPreviewLayoutState> {
    constructor(props: IPreviewLayoutProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    componentDidCatch(error: Error) {
        this.setState({ hasError: true, error });
        console.error('Preview error:', error);
    }

    render() {
        const { title, description, children } = this.props;
        const { hasError, error } = this.state;

        return (
            <div class="preview-container">
                <div class="preview-card">
                    <header class="preview-header">
                        <h1 class="preview-title">{title}</h1>
                        {description && <p class="preview-description">{description}</p>}
                    </header>

                    <div class="preview-content">
                        {hasError ? (
                            <div class="preview-error">
                                <div class="preview-error__icon">⚠️</div>
                                <div class="preview-error__title">Component Error</div>
                                <div class="preview-error__message">{error?.message}</div>
                                <details class="preview-error__details">
                                    <summary>Stack trace</summary>
                                    <pre>{error?.stack}</pre>
                                </details>
                            </div>
                        ) : (
                            children
                        )}
                    </div>

                    <footer class="preview-footer">
                        Production mode via mc-entry.ts
                    </footer>
                </div>
            </div>
        );
    }
}
