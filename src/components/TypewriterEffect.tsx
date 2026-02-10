import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
    phrases: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string; // For text styling (color, font, etc.)
}

export default function TypewriterEffect({
    phrases,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
    className = ""
}: TypewriterEffectProps) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];

        // Determine handling speed based on state
        const handleTyping = () => {
            if (isDeleting) {
                // Deleting text
                setDisplayedText(prev => prev.substring(0, prev.length - 1));
            } else {
                // Typing text
                setDisplayedText(prev => currentPhrase.substring(0, prev.length + 1));
            }
        };

        let timer: ReturnType<typeof setTimeout>;

        // Logic for state transitions
        if (!isDeleting && displayedText === currentPhrase) {
            // Finished typing phrase, pause before deleting
            timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && displayedText === "") {
            // Finished deleting, move to next phrase
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        } else {
            // Continue typing or deleting
            const speed = isDeleting ? deletingSpeed : typingSpeed;
            // Add slight randomness to typing speed for realism
            const randomSpeed = isDeleting ? speed : speed + Math.random() * 50;
            timer = setTimeout(handleTyping, randomSpeed);
        }

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, phrases, currentPhraseIndex, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={`${className} inline-flex items-center`}>
            {displayedText}
            <span className="ml-1 w-[3px] h-[1em] bg-accent-gold animate-blink"></span>
        </span>
    );
}
