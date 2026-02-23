'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
}

export default function VideoPlayer({
    src,
    poster,
    className = "",
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false
}: VideoPlayerProps) {
    const [isMuted, setIsMuted] = useState(muted);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const videoRef = useRef<HTMLVideoElement>(null);

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        try {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        } catch (e) {
            console.error('Error parsing YouTube URL:', e);
            return null;
        }
    };

    let youtubeId = null;
    try {
        youtubeId = src ? getYouTubeId(src) : null;
    } catch (e) {
        console.error('Failed to process video source:', e);
    }

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    if (youtubeId) {
        // YouTube Embed
        const params = new URLSearchParams({
            autoplay: autoPlay ? '1' : '0',
            mute: isMuted ? '1' : '0',
            controls: controls ? '1' : '0',
            loop: loop ? '1' : '0',
            playlist: loop ? youtubeId : '', // Required for loop to work
            playsinline: '1',
            rel: '0',
            showinfo: '0',
            modestbranding: '1',
            iv_load_policy: '3'
        });

        return (
            <div className={`relative overflow-hidden w-full h-full bg-black ${className}`}>
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?${params.toString()}`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-150" // Scale to hide controls/branding
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video Player"
                />
                {/* Overlay to prevent interaction if controls are off */}
                {!controls && <div className="absolute inset-0 z-10" />}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden w-full h-full bg-black ${className} group`}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-cover"
                autoPlay={autoPlay}
                muted={muted} // Start muted for autoplay policy
                loop={loop}
                playsInline
                controls={controls}
            />

            {!controls && (
                <button
                    onClick={() => {
                        setIsMuted(!isMuted);
                        if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="absolute bottom-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            )}
        </div>
    );
}
