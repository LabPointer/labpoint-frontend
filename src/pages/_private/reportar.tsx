import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";

export const Route = createFileRoute("/_private/reportar")({
    component: RouteComponent,
});

type ProblemType =
    | "Esgoto a céu aberto"
    | "Lixo acumulado"
    | "Vazamento de água"
    | "Bueiro entupido"
    | "Água contaminada"
    | "Falta de saneamento"
    | "Poluição do ar"
    | "Desmatamento"
    | "Outro";

const problemTypes: ProblemType[] = [
    "Esgoto a céu aberto",
    "Lixo acumulado",
    "Vazamento de água",
    "Bueiro entupido",
    "Água contaminada",
    "Falta de saneamento",
    "Poluição do ar",
    "Desmatamento",
    "Outro",
];

function RouteComponent() {
    const [problemType, setProblemType] = useState<ProblemType | "">("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const [useGoogleMaps, setUseGoogleMaps] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
        }
    }

    function handleRemoveFile(index: number) {
        setFiles(files.filter((_, i) => i !== index));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Adicione sua lógica de envio aqui
        console.log("Denúncia:", {
            description,
            problemType,
            address,
            files,
        });
    }

    return (
        <div className="min-h-[calc((100vh-81px))] mt-[81px] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-3xl">
                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg border-2 border-black/10 dark:border-white/10 shadow-lg dark:shadow-white/10 p-8 md:p-12">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">
                            Reportar Problema
                        </h1>
                        <p className="text-sm">
                            Ajude a melhorar o saneamento e meio ambiente em
                            Anápolis
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="problemType"
                                className="block text-sm font-medium mb-2"
                            >
                                Tipo de Problema{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="problemType"
                                value={problemType}
                                onChange={(e) =>
                                    setProblemType(
                                        e.target.value as ProblemType
                                    )
                                }
                                required
                                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-neutral-800"
                            >
                                <option value="">
                                    Selecione o tipo de problema
                                </option>
                                {problemTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium mb-2"
                            >
                                Descrição do Problema{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={5}
                                className="w-full px-4 py-3 placeholder-bg-neutral-500 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                placeholder="Descreva detalhadamente o problema encontrado..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Foto ou Vídeo{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    required={files.length === 0}
                                    multiple
                                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 hover:cursor-pointer hover:file:cursor-pointer"
                                />
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                                            >
                                                <span className="text-sm truncate flex-1">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveFile(index)
                                                    }
                                                    className="ml-2 hover:cursor-pointer text-red-500 dark:text-red-600 hover:text-red-600 hover:dark:text-red-500 text-sm font-medium"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-neutral-500">
                                    Formatos aceitos: imagens e vídeos.
                                    Múltiplos arquivos permitidos.
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">
                                    Endereço{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setUseGoogleMaps(!useGoogleMaps)
                                    }
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:cursor-pointer"
                                >
                                    {useGoogleMaps
                                        ? "Digitar manualmente"
                                        : "Usar Google Maps"}
                                </button>
                            </div>

                            {useGoogleMaps ? (
                                <div className="space-y-3">
                                    <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
                                        <p className="text-sm text-neutral-500">
                                            Integração com Google Maps
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        required
                                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Endereço selecionado no mapa"
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    placeholder="Ex: Rua Exemplo, 123 - Centro, Anápolis - GO"
                                />
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Enviar Denúncia
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
