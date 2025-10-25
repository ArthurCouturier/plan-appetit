import { Link } from 'react-router-dom';
import { Typography } from '@material-tailwind/react';

export default function Footer() {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-auto relative bottom-0">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Typography
                        variant="small"
                        className="text-gray-600 text-center md:text-left"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                    >
                        © {new Date().getFullYear()} Plan Appetit. Tous droits réservés.
                    </Typography>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/legal/cgu"
                            className="text-sm text-blue-600 hover:underline transition-colors"
                        >
                            CGU
                        </Link>
                        <Link
                            to="/legal/cgv"
                            className="text-sm text-blue-600 hover:underline transition-colors"
                        >
                            CGV
                        </Link>
                        <Link
                            to="/legal/politique-de-confidentialite"
                            className="text-sm text-blue-600 hover:underline transition-colors"
                        >
                            Confidentialité
                        </Link>
                        <Link
                            to="/legal/mentions-legales"
                            className="text-sm text-blue-600 hover:underline transition-colors"
                        >
                            Mentions Légales
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
