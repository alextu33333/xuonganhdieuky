
import React, { useState, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { OptionsPanel } from './components/OptionsPanel';
import { ItemSelector } from './components/SceneSelector';
import { CustomPrompt } from './components/CustomPrompt';
import { ImageOutput } from './components/ImageOutput';
import { Introduction } from './components/Introduction';
import { ToggleSwitch } from './components/ToggleSwitch';
import { CollapsibleSection } from './components/CollapsibleSection';
import { SparklesIcon } from './components/icons';
import {
    VIETNAM_SCENES, WORLD_SCENES, STUDIO_SCENES, ACCESSORY_SCENES,
    AO_DAI_COSTUMES, LUXURY_COSTUMES, VIETNAM_REGIONAL_COSTUMES,
    STYLES, RESOLUTION_OPTIONS, SHOOTING_ANGLES, IMAGE_EFFECTS
} from './constants';
import type { Scene, Costume, AspectRatio, Resolution, UploadedPerson } from './types';
import { generateImage, generateEnhancedPrompt } from './services/geminiService';

type SceneCategory = 'vietnam' | 'world' | 'studio';
type CostumeCategory = 'ao_dai' | 'luxury' | 'regional';

const sceneCategories: { id: SceneCategory, name: string }[] = [
    { id: 'vietnam', name: 'Việt Nam' },
    { id: 'world', name: 'Thế Giới' },
    { id: 'studio', name: 'Studio' },
];

const costumeCategories: { id: CostumeCategory, name: string }[] = [
    { id: 'ao_dai', name: 'Áo Dài' },
    { id: 'luxury', name: 'Sang Trọng' },
    { id: 'regional', name: 'Vùng Miền' },
];

const App: React.FC = () => {
    const [uploadedPerson, setUploadedPerson] = useState<UploadedPerson | null>(null);
    const [uploadedFriends, setUploadedFriends] = useState<(UploadedPerson | null)[]>(Array(3).fill(null));
    const [uploadedProduct, setUploadedProduct] = useState<UploadedPerson | null>(null);

    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [numImages, setNumImages] = useState(1);
    const [selectedStyleId, setSelectedStyleId] = useState<string>('photorealistic');
    const [resolution, setResolution] = useState<Resolution>('hd');
    const [isFullBody, setIsFullBody] = useState(false);
    const [selectedAngleId, setSelectedAngleId] = useState<string | null>(null);
    const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

    const [selectedScene, setSelectedScene] = useState<Scene | null>(VIETNAM_SCENES[0]);
    const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
    const [selectedAccessory, setSelectedAccessory] = useState<Scene | null>(null);
    
    const [sceneCategory, setSceneCategory] = useState<SceneCategory>('vietnam');
    const [costumeCategory, setCostumeCategory] = useState<CostumeCategory>('ao_dai');
    
    const [useCustomPrompt, setUseCustomPrompt] = useState(false);
    const [customText, setCustomText] = useState('');
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    
    const [isFriendSectionOpen, setIsFriendSectionOpen] = useState(false);
    const [isProductSectionOpen, setIsProductSectionOpen] = useState(false);

    const sceneLists = useMemo((): Record<SceneCategory, Scene[]> => ({
        vietnam: VIETNAM_SCENES,
        world: WORLD_SCENES,
        studio: STUDIO_SCENES,
    }), []);
    
    const costumeLists = useMemo((): Record<CostumeCategory, Costume[]> => ({
        ao_dai: AO_DAI_COSTUMES,
        luxury: LUXURY_COSTUMES,
        regional: VIETNAM_REGIONAL_COSTUMES,
    }), []);
    
    const handleImageUpload = (file: File, base64: string) => {
        setUploadedPerson({ file, base64 });
    };

    const handleFriendUpload = (index: number, file: File, base64: string) => {
        const newFriends = [...uploadedFriends];
        newFriends[index] = { file, base64 };
        setUploadedFriends(newFriends);
    };

    const handleFriendRemove = (index: number) => {
        const newFriends = [...uploadedFriends];
        newFriends[index] = null;
        setUploadedFriends(newFriends);
    };

    const handleGeneratePrompt = async () => {
        if (!customText.trim()) return;
        setIsGeneratingPrompt(true);
        setError(null);
        try {
            const prompt = await generateEnhancedPrompt(customText);
            setGeneratedPrompt(prompt);
        } catch (e) {
            console.error(e);
            setError('Could not generate a better prompt. Please check your connection or API key and try again.');
        } finally {
            setIsGeneratingPrompt(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!uploadedPerson) {
            setError('Please upload a photo of the person first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        
        try {
            let finalPrompt = '';
            if (useCustomPrompt) {
                finalPrompt = generatedPrompt || customText;
                if (!finalPrompt.trim()) {
                     setError('Please provide a custom prompt or generate one.');
                     setIsLoading(false);
                     return;
                }
            }
            
            const scenePrompt = !useCustomPrompt ? [selectedScene?.prompt, selectedAccessory?.prompt].filter(Boolean).join('. ') : finalPrompt;
            const costumePrompt = !useCustomPrompt ? selectedCostume?.prompt || '' : '';
            
            if (!useCustomPrompt && !scenePrompt) {
                 setError('Please select a scene.');
                 setIsLoading(false);
                 return;
            }

            const stylePrompt = STYLES.find(s => s.id === selectedStyleId)?.prompt || '';
            const resolutionPrompt = RESOLUTION_OPTIONS.find(r => r.value === resolution)?.prompt || '';
            const anglePrompt = SHOOTING_ANGLES.find(a => a.id === selectedAngleId)?.prompt || '';
            const effectPrompt = IMAGE_EFFECTS.find(e => e.id === selectedEffectId)?.prompt || '';
            
            const friends = uploadedFriends.filter((f): f is UploadedPerson => f !== null);

            const images = await generateImage({
                person: uploadedPerson,
                friends: friends,
                product: uploadedProduct,
                scenePrompt,
                costumePrompt,
                stylePrompt,
                resolutionPrompt,
                isFullBody,
                anglePrompt,
                effectPrompt,
                numImages,
            });
            setGeneratedImages(images);
        } catch (e: any) {
            console.error(e);
            setError(`An error occurred during image generation: ${e.message}. Please try again or check the console for details.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const TabButton: React.FC<{
        label: string;
        isActive: boolean;
        onClick: () => void;
    }> = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                isActive
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-amber-300">Xưởng Ảnh Diệu Kỳ</h1>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">APP ĐƯỢC TẠO BỞI MR4</p>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel */}
                    <div className="lg:col-span-1 space-y-8">
                        <Introduction />

                        <div className="p-6 bg-gray-800 rounded-2xl shadow-lg space-y-6 border border-gray-700">
                            <ImageUploader 
                                label="1. Tải Lên Ảnh Gốc"
                                description="Chọn ảnh chân dung rõ mặt, chính diện để có kết quả tốt nhất."
                                onImageUpload={handleImageUpload}
                                preview={uploadedPerson ? `data:${uploadedPerson.file.type};base64,${uploadedPerson.base64}` : null}
                                isMainUploader
                            />
                        </div>

                        <CollapsibleSection
                            title="Thêm Bạn Bè (Tùy chọn)"
                            isOpen={isFriendSectionOpen}
                            onToggle={() => setIsFriendSectionOpen(!isFriendSectionOpen)}
                        >
                            <div className="space-y-4">
                                {[...Array(3)].map((_, index) => (
                                    <ImageUploader
                                        key={index}
                                        label={`Bạn Bè ${index + 1}`}
                                        description=""
                                        onImageUpload={(file, base64) => handleFriendUpload(index, file, base64)}
                                        preview={uploadedFriends[index] ? `data:${uploadedFriends[index]!.file.type};base64,${uploadedFriends[index]!.base64}` : null}
                                        onImageRemove={() => handleFriendRemove(index)}
                                    />
                                ))}
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Tải Ảnh Sản Phẩm (Tùy chọn)"
                            isOpen={isProductSectionOpen}
                            onToggle={() => setIsProductSectionOpen(!isProductSectionOpen)}
                        >
                            <ImageUploader
                                label=""
                                description="Tải ảnh sản phẩm bạn muốn nhân vật cầm. AI sẽ đảm bảo kích thước thực tế."
                                onImageUpload={(file, base64) => setUploadedProduct({ file, base64 })}
                                preview={uploadedProduct ? `data:${uploadedProduct.file.type};base64,${uploadedProduct.base64}` : null}
                                onImageRemove={() => setUploadedProduct(null)}
                            />
                        </CollapsibleSection>
                        
                        <div className="p-6 bg-gray-800 rounded-2xl shadow-lg space-y-6 border border-gray-700">
                           <OptionsPanel
                                aspectRatio={aspectRatio}
                                setAspectRatio={setAspectRatio}
                                numImages={numImages}
                                setNumImages={setNumImages}
                                selectedStyle={selectedStyleId}
                                setSelectedStyle={setSelectedStyleId}
                                resolution={resolution}
                                setResolution={setResolution}
                                isFullBody={isFullBody}
                                setIsFullBody={setIsFullBody}
                                selectedAngleId={selectedAngleId}
                                setSelectedAngleId={setSelectedAngleId}
                                selectedEffectId={selectedEffectId}
                                setSelectedEffectId={setSelectedEffectId}
                            />
                        </div>

                         <div className="p-6 bg-gray-800 rounded-2xl shadow-lg space-y-4 border border-gray-700">
                            <h2 className="text-lg font-semibold text-amber-300">3. Chọn Bối Cảnh & Trang Phục</h2>
                            <ToggleSwitch enabled={useCustomPrompt} onChange={setUseCustomPrompt} label="Tự Tạo Bối Cảnh (Nâng cao)" />

                            {useCustomPrompt ? (
                                <CustomPrompt 
                                    customText={customText}
                                    onTextChange={setCustomText}
                                    onGeneratePrompt={handleGeneratePrompt}
                                    generatedPrompt={generatedPrompt}
                                    isGenerating={isGeneratingPrompt}
                                />
                            ) : (
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <h3 className="text-md font-medium text-gray-200 mb-2">Bối Cảnh</h3>
                                        <div className="flex space-x-2 mb-3">
                                            {sceneCategories.map(cat => (
                                                <TabButton key={cat.id} label={cat.name} isActive={sceneCategory === cat.id} onClick={() => setSceneCategory(cat.id)} />
                                            ))}
                                        </div>
                                        <ItemSelector title="Bối Cảnh" items={sceneLists[sceneCategory]} selectedItem={selectedScene} onSelectItem={item => setSelectedScene(item as Scene | null)} />
                                    </div>
                                    <div>
                                        <h3 className="text-md font-medium text-gray-200 mb-2">Trang Phục</h3>
                                        <div className="flex space-x-2 mb-3">
                                            {costumeCategories.map(cat => (
                                                <TabButton key={cat.id} label={cat.name} isActive={costumeCategory === cat.id} onClick={() => setCostumeCategory(cat.id)} />
                                            ))}
                                        </div>
                                        <ItemSelector title="Trang Phục" items={costumeLists[costumeCategory]} selectedItem={selectedCostume} onSelectItem={item => setSelectedCostume(item as Costume | null)} />
                                    </div>
                                    <div>
                                        <h3 className="text-md font-medium text-gray-200 mb-2">Phụ Kiện Thêm</h3>
                                        <ItemSelector title="Phụ Kiện" items={ACCESSORY_SCENES} selectedItem={selectedAccessory} onSelectItem={item => setSelectedAccessory(item as Scene | null)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-6">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !uploadedPerson}
                                className="w-full bg-amber-500 text-gray-900 font-bold text-lg py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-amber-500/20"
                            >
                                <SparklesIcon className="h-6 w-6"/>
                                {isLoading ? 'Đang Xử Lý...' : 'Tạo Ra Điều Kỳ Diệu'}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-2 min-h-[60vh] lg:min-h-0">
                         <div className="sticky top-24">
                           <ImageOutput isLoading={isLoading} images={generatedImages} error={error} />
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
