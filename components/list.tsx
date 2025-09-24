'use client';

import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "./ui/button"
import { Project } from "@/data"
import { Category } from "@/app/(root)/page"
import posthog from 'posthog-js'

interface ListProps {
    projects: Project[]
    categories: Category[]
    searchParams: { category?: string }
}

export default function List({ projects, categories, searchParams }: ListProps) {
    const handleGameClick = (project: Project) => {
        posthog.capture('game_clicked', {
            game_name: project.name,
            game_category: project.category,
            has_url: !!project.url,
            page_url: window.location.href
        });
    };

    const handleComingSoonClick = (project: Project) => {
        posthog.capture('coming_soon_game_clicked', {
            game_name: project.name,
            game_category: project.category,
            page_url: window.location.href
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 py-8">
            {projects
                .filter(
                    project =>
                        !searchParams ||
                        searchParams.category === undefined ||
                        project.category === searchParams.category
                )
                .map(project => 
                    project.url ? (
                        <Link 
                            href={project.url} 
                            key={project.name} 
                            className="max-h-[254px] relative border rounded-lg group overflow-hidden"
                            onClick={() => handleGameClick(project)}
                        >
                            <div className="relative overflow-hidden">
                                <Image
                                    className="rounded-lg transition-transform duration-300 group-hover:scale-105 object-cover object-center"
                                    quality={100}
                                    src={project.img}
                                    alt={project.name}
                                    width={453}
                                    height={254}
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div
                                    className={buttonVariants({
                                        variant: "default",
                                        className: "!rounded-full text-xs border border-secondary/20 gap-0.5 h-7 !px-2"
                                    })}
                                >
                                    {project.name}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 p-3">
                                <div
                                    className={buttonVariants({
                                        variant: "default",
                                        className: "!rounded-full text-xs border border-secondary/20 gap-0.5 h-7 !px-3"
                                    })}
                                >
                                    {(categories.find(category => category.name === project.category)
                                        ?.icon as React.ReactNode) ?? null}
                                    {project.category}
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div 
                            key={project.name} 
                            className="max-h-[254px] relative border rounded-lg group overflow-hidden cursor-pointer"
                            onClick={() => handleComingSoonClick(project)}
                        >
                            <div className="relative overflow-hidden">
                                <Image
                                    className="rounded-lg transition-transform duration-300 group-hover:scale-105 object-cover object-center"
                                    quality={100}
                                    src={project.img}
                                    alt={project.name}
                                    width={453}
                                    height={254}
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="absolute top-2 left-2">
                                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    Coming Soon
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div
                                    className={buttonVariants({
                                        variant: "default",
                                        className: "!rounded-full text-xs border border-secondary/20 gap-0.5 h-7 !px-2"
                                    })}
                                >
                                    {project.name}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 p-3">
                                <div
                                    className={buttonVariants({
                                        variant: "default",
                                        className: "!rounded-full text-xs border border-secondary/20 gap-0.5 h-7 !px-3"
                                    })}
                                >
                                    {(categories.find(category => category.name === project.category)
                                        ?.icon as React.ReactNode) ?? null}
                                    {project.category}
                                </div>
                            </div>
                        </div>
                    )
                )}
        </div>
    )
}