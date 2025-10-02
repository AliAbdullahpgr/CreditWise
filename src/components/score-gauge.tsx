"use client";
import React, { useEffect, useState } from "react";

type ScoreGaugeProps = {
  value: number;
  max?: number;
};

export function ScoreGauge({ value, max = 1000 }: ScoreGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [grade, setGrade] = useState("D");
  const [gradeColor, setGradeColor] = useState("text-red-500");

  useEffect(() => {
    const animation = requestAnimationFrame(() => setAnimatedValue(value));
    return () => cancelAnimationFrame(animation);
  }, [value]);

  useEffect(() => {
    if (value >= 800) {
      setGrade("A");
      setGradeColor("text-green-500");
    } else if (value >= 600) {
      setGrade("B");
      setGradeColor("text-blue-500");
    } else if (value >= 400) {
      setGrade("C");
      setGradeColor("text-yellow-500");
    } else {
      setGrade("D");
      setGradeColor("text-red-500");
    }
  }, [value]);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (animatedValue / max) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-secondary"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        <circle
          className="text-primary transition-all duration-1000 ease-out"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-headline text-foreground">
          {Math.round(animatedValue)}
        </span>
        <span className={`text-lg font-semibold ${gradeColor}`}>
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
