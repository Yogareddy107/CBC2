import { Github, Gitlab, Cloud, Code, Terminal, Layers } from 'lucide-react';

export const SocialProofSection = () => {
    const ecosystems = [
        { name: 'GitHub', icon: <Github className="w-5 h-5" /> },
        { name: 'GitLab', icon: <Gitlab className="w-5 h-5" /> },
        { name: 'Azure DevOps', icon: <Layers className="w-5 h-5" /> },
        { name: 'Bitbucket', icon: <Terminal className="w-5 h-5" /> },
        { name: 'VS Code', icon: <Code className="w-5 h-5" /> },
        { name: 'IntelliJ', icon: <Code className="w-5 h-5" /> },
        { name: 'Cloud Native', icon: <Cloud className="w-5 h-5" /> },
    ];

    const items = [...ecosystems, ...ecosystems];

    return (
        <section className="py-20 bg-white border-b border-[#1A1A1A]/5 overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-6">
                <p className="text-center text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.3em] mb-12">
                    Enterprise-Scale Infrastructure Compatibility
                </p>
                <div className="relative">
                    <div className="flex w-fit items-center gap-16 opacity-40 grayscale animate-scroll">
                        {items.map((item, idx) => (
                            <div key={`${item.name}-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
                                <span className="text-[#1A1A1A]">{item.icon}</span>
                                <span className="text-xl font-bold tracking-tighter text-[#1A1A1A]">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
                </div>
            </div>
        </section>
    );
};

