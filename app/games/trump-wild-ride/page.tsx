'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
import { TrumpWildRideGame } from './game';
import './style.css';
import posthog from 'posthog-js';
import { GAME_EVENTS, GAME_PROPERTIES, GAME_NAMES } from '@/lib/analytics';

const TrumpWildRidePage: React.FC = () => {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const infoBtnRef = useRef<HTMLButtonElement>(null);
    const infoDialogRef = useRef<HTMLDivElement>(null);
    const leftBtnRef = useRef<HTMLButtonElement>(null);
    const rightBtnRef = useRef<HTMLButtonElement>(null);
    const jumpBtnRef = useRef<HTMLButtonElement>(null);
    const startBtnRef = useRef<HTMLButtonElement>(null);
    const scoreRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<TrumpWildRideGame | null>(null);

    useEffect(() => {
        // Track game page visit
        posthog.capture('game_page_visited', {
            [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE,
            page_url: window.location.href,
            referrer: document.referrer
        });

        if (
            canvasRef.current &&
            infoBtnRef.current &&
            infoDialogRef.current &&
            leftBtnRef.current &&
            rightBtnRef.current &&
            jumpBtnRef.current &&
            startBtnRef.current &&
            scoreRef.current
        ) {
            gameInstanceRef.current = new TrumpWildRideGame({
                canvas: canvasRef.current,
                infoBtn: infoBtnRef.current,
                infoDialog: infoDialogRef.current,
                leftBtn: leftBtnRef.current,
                rightBtn: rightBtnRef.current,
                jumpBtn: jumpBtnRef.current,
                startBtn: startBtnRef.current,
                scoreElement: scoreRef.current,
            });
        }

        return () => {
            gameInstanceRef.current?.cleanup();
        };
    }, []);

    const handleBackClick = () => {
        // Track navigation back from game
        posthog.capture('game_page_back_clicked', {
            [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.TRUMP_WILD_RIDE
        });
        router.back();
    };

    return (
        <div id="app">
            <div id="gameContainer">
                <button id="backBtn" onClick={handleBackClick} title="Go Back">
                    <ArrowLeft size={24} />
                </button>
                <button id="infoBtn" title="Game Guide" ref={infoBtnRef}><Info size={24} /></button>
                
                <div id="infoDialog" className="hidden" ref={infoDialogRef}>
                    <h3>Game Guide</h3>
                    
                    <div className="info-section">
                        <h4>🚫 Enemies</h4>
                        <div className="info-item">
                            <span className="enemy-icon rock">🪨</span>
                            <div>
                                <strong>Ground Rocks</strong><br />
                                Large brown obstacles on ground
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="enemy-icon rock-moving">🪨</span>
                            <div>
                                <strong>Moving Rocks</strong><br />
                                Rocks that bounce up and down
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="enemy-icon flying">🟣</span>
                            <div>
                                <strong>Flying Enemies</strong><br />
                                Purple blocks floating in air
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="enemy-icon plant">🌿</span>
                            <div>
                                <strong>Spike Plants</strong><br />
                                Tall dangerous plants on ground
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>⚡ Power-ups</h4>
                        <div className="info-item">
                            <span className="powerup-icon speed">S</span>
                            <div>
                                <strong>Speed Boost</strong><br />
                                50% faster game speed (5s)
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="powerup-icon invincible">I</span>
                            <div>
                                <strong>Invincibility</strong><br />
                                Immune to all damage (4s)
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="powerup-icon jump">J</span>
                            <div>
                                <strong>Double Jump</strong><br />
                                Jump again while airborne (8s)
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="powerup-icon multiplier">X</span>
                            <div>
                                <strong>Score Multiplier</strong><br />
                                Double all points earned (6s)
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>❤️ Lives</h4>
                        <p>You have 3 lives. Lose 1 when hit by enemies. Hearts on character show remaining lives.</p>
                    </div>
                </div>

                <div id="header">
                    <h1>Trump's Wild Ride</h1>
                </div>
                <canvas id="gameCanvas" width="1200" height="600" ref={canvasRef}></canvas>
                
                <div id="mobileControls">
                    <button id="leftBtn" className="control-btn" ref={leftBtnRef}>←</button>
                    <button id="jumpBtn" className="control-btn jump-btn" ref={jumpBtnRef}>JUMP</button>
                    <button id="rightBtn" className="control-btn" ref={rightBtnRef}>→</button>
                </div>
                
                <div id="gameUI">
                    <div id="score" ref={scoreRef}>Score: 0</div>
                    <div id="instructions">Press SPACE to jump | Arrow Keys or A/D to move | Avoid the obstacles!</div>
                    <button id="startBtn" ref={startBtnRef}>Start Game</button>
                </div>
            </div>
        </div>
    );
};

export default TrumpWildRidePage; 