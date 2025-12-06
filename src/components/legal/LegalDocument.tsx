import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardBody, Button } from '@material-tailwind/react';
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Header from '../global/Header';

interface LegalDocumentProps {
    documentPath: string;
    title: string;
}

export default function LegalDocument({ documentPath, title }: LegalDocumentProps) {
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetch(documentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Impossible de charger le document');
                }
                return response.text();
            })
            .then(text => {
                setContent(text);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [documentPath]);

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = documentPath.split('/').pop() || 'document.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'mobile-content-with-header' : ''}`}>
            {!isMobile && <Header back={true} home={true} title={false} profile={false} />}

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <CardBody placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        {/* Header avec titre et boutons */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {title}
                            </h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={handleDownload}
                                    className="flex items-center gap-2"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    disabled={loading || !!error}
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Télécharger
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    Retour
                                </Button>
                            </div>
                        </div>

                        {/* Contenu */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">
                                    ❌ Erreur : {error}
                                </p>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="prose prose-sm md:prose-base max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ node, ...props }) => (
                                            <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3" {...props} />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2" {...props} />
                                        ),
                                        h4: ({ node, ...props }) => (
                                            <h4 className="text-lg font-semibold text-gray-700 mt-3 mb-2" {...props} />
                                        ),
                                        p: ({ node, ...props }) => (
                                            <p className="text-gray-700 leading-relaxed mb-4" {...props} />
                                        ),
                                        ul: ({ node, ...props }) => (
                                            <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                                        ),
                                        li: ({ node, ...props }) => (
                                            <li className="text-gray-700" {...props} />
                                        ),
                                        a: ({ node, ...props }) => (
                                            <a className="text-blue-600 hover:underline" {...props} />
                                        ),
                                        strong: ({ node, ...props }) => (
                                            <strong className="font-bold text-gray-900" {...props} />
                                        ),
                                        code: ({ node, ...props }) => (
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />
                                        ),
                                        pre: ({ node, ...props }) => (
                                            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                                        ),
                                        table: ({ node, ...props }) => (
                                            <div className="overflow-x-auto mb-4">
                                                <table className="min-w-full border-collapse border border-gray-300" {...props} />
                                            </div>
                                        ),
                                        thead: ({ node, ...props }) => (
                                            <thead className="bg-gray-50" {...props} />
                                        ),
                                        th: ({ node, ...props }) => (
                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700" {...props} />
                                        ),
                                        td: ({ node, ...props }) => (
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
                                        ),
                                        hr: ({ node, ...props }) => (
                                            <hr className="my-8 border-gray-300" {...props} />
                                        ),
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
                                        ),
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
