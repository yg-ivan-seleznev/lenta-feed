import './mc-wrapper.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { McPackage } from '../src/mc-entry';
import styles from '../src/styles.css?inline';
import { mockApiFetch, mockUserData } from './mock-api';

export interface IMcWrapperProps<TProps> {
    /** PascalCase component name (e.g. "ButtonPopup") */
    componentName: string;
    /** Component props */
    props: TProps;
    /** Optional title */
    title?: string;
}

interface IErrorState {
    hasError: boolean;
    message: string;
}

// Store stylesheet instances per shadow root for HMR updates
const shadowStyleSheets = new WeakMap<ShadowRoot, CSSStyleSheet>();

function getMcPackage(): McPackage {
    return new McPackage({
        name: 'mc-component',
        version: '1.0.0',
        packageUrl: 'http://localhost:5173',
        dispatcher: {
            dispatch: (action, data) => {
                alert(`📤 Dispatcher Event\n\nAction: ${action}\nData: ${JSON.stringify(data, null, 2)}`);
            },
            subscribe: () => {},
        },
        apiFetch: mockApiFetch,
        mainCatalogFeedEndpoint: '/catalogue/v2/feed/',
        userData: mockUserData,
    });
}

// HMR: Update all stylesheet instances when styles.css changes
if (import.meta.hot) {
    import.meta.hot.accept('../src/styles.css?inline', (newStyles) => {
        if (!newStyles?.default) {
            return;
        }

        const newCss = newStyles.default;

        // Update all active shadow roots
        document.querySelectorAll('[data-mc-wrapper]').forEach((element) => {
            const shadow = element.shadowRoot;

            if (!shadow) {
                return;
            }

            const sheet = shadowStyleSheets.get(shadow);

            if (sheet) {
                try {
                    sheet.replaceSync(newCss);
                    console.info('🔄 HMR: Updated styles in Shadow DOM');
                } catch (err) {
                    console.error('HMR: Failed to update styles', err);
                }
            }
        });
    });
}

function getOrCreateContainer(shadow: ShadowRoot): HTMLDivElement {
    const existing = shadow.querySelector('.mc-root');

    if (existing instanceof HTMLDivElement) {
        return existing;
    }

    const container = document.createElement('div');

    container.className = 'mc-root';
    shadow.appendChild(container);

    return container;
}

function callRenderMethod<TProps>(
    mcPackage: McPackage,
    componentName: string,
    container: HTMLElement,
    props: TProps,
): void {
    const methodName = `renderMc${componentName}`;
    const method = mcPackage[methodName as keyof McPackage];

    if (typeof method !== 'function') {
        const available = Object.keys(mcPackage).filter((k) => k.startsWith('renderMc'));

        throw new Error(`Method ${methodName} not found in McPackage. Available: ${available.join(', ') || 'none'}`);
    }

    (method as (container: HTMLElement, props: TProps) => void).call(mcPackage, container, props);
}

/**
 * Generic wrapper for rendering via mc-entry.ts (production-like mode)
 */
export function McWrapper<TProps>({ componentName, props, title }: IMcWrapperProps<TProps>) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<IErrorState>({ hasError: false, message: '' });

    useEffect(() => {
        setError({ hasError: false, message: '' });

        if (!ref.current) {
            return;
        }

        try {
            // Mark element for HMR tracking
            ref.current.setAttribute('data-mc-wrapper', '');

            const shadow = ref.current.shadowRoot || ref.current.attachShadow({ mode: 'open' });

            // Inject or update styles
            let styleSheet = shadowStyleSheets.get(shadow);

            if (!styleSheet) {
                styleSheet = new CSSStyleSheet();
                styleSheet.replaceSync(styles);
                shadowStyleSheets.set(shadow, styleSheet);
                // eslint-disable-next-line react-compiler/react-compiler -- need mutation
                shadow.adoptedStyleSheets = [styleSheet];
            }

            // Get or create container
            const container = getOrCreateContainer(shadow);

            // Get current McPackage (with HMR support)
            const mcPackage = getMcPackage();

            // Call render with new props
            callRenderMethod(mcPackage, componentName, container, props);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);

            setError({ hasError: true, message });
            console.error(`McWrapper error for ${componentName}:`, err);
        }
    }, [componentName, props]);

    if (error.hasError) {
        return (
            <div class="mc-wrapper-error">
                {title && <h3 class="mc-wrapper-error__title">{title}</h3>}
                <div class="mc-wrapper-error__content">
                    <div class="mc-wrapper-error__icon">⚠️</div>
                    <div class="mc-wrapper-error__message">{error.message}</div>
                    <div class="mc-wrapper-error__hint">
                        Check console. Fix <code>src/mc-entry.ts</code> or <code>src/component.tsx</code>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class="mc-wrapper">
            {title && <h3 class="mc-wrapper__title">{title}</h3>}
            <div ref={ref} />
        </div>
    );
}
