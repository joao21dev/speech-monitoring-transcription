import React, { useState } from 'react';
import { startMonitoring } from '../utils/vadRecorder';

const Exam: React.FC = () => {
    const [status, setStatus] = useState<string>('Status: Not Monitoring');
    const [recordings, setRecordings] = useState<string[]>([]);

    const handleStartExam = () => {
        setStatus('Status: Monitoring');
        startMonitoring((newRecording: string) => {
            setRecordings((prevRecordings) => [...prevRecordings, newRecording]);
        });
    };

    return (
        <div>
            <h1>Exam Page</h1>
            <button onClick={handleStartExam}>Start Exam</button>
            <div>{status}</div>
            <div>
                {recordings.map((recording, index) => (
                    <audio key={index} controls src={recording}></audio>
                ))}
            </div>
        </div>
    );
};

export default Exam;