import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    profesoresFiltrados: any[];
    onProfesorSelect: (profesor: any, cubiculo: any) => void;
    canViewProfesores: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
    searchTerm, 
    setSearchTerm, 
    profesoresFiltrados, 
    onProfesorSelect,
    canViewProfesores 
}) => {
    return (
        <div className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-4 py-3 relative">
            <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--app-text-secondary)]" />
                <input
                    type="text"
                    placeholder={canViewProfesores ? "Buscar edificios, profes..." : "Buscar edificios..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)]"
                />
                {searchTerm && profesoresFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-2xl z-[2000] max-h-60 overflow-y-auto">
                        {profesoresFiltrados.map(p => (
                            <div key={p.id_profesor} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm" onClick={() => {
                                if (p.cubiculos && p.cubiculos.length > 0) {
                                    const cubiculo = p.cubiculos[0];
                                    onProfesorSelect(p, cubiculo);
                                }
                                setSearchTerm('');
                            }}>
                                <p className="font-bold text-gray-800 dark:text-white">{p.usuario?.nombre || 'Profesor'}</p>
                                <p className="text-xs text-gray-500">{p.departamento}</p>
                                {p.cubiculos && p.cubiculos.length > 0 && (
                                    <p className="text-xs text-blue-500 mt-1">
                                        Cubículo {p.cubiculos[0].numero}, Piso {p.cubiculos[0].piso}
                                        {p.cubiculos[0].edificio?.nombre ? ` - ${p.cubiculos[0].edificio.nombre}` : ''}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
