import React, { useState } from 'react';
import { UserProfile } from '../types';

interface UserInfoFormProps {
    onSubmit: (profile: UserProfile) => void;
}

const gradeLevels = [
    'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học/Cao đẳng', 'Kiến thức chung'
];

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [wakeWord, setWakeWord] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && gradeLevel) {
            const profile: UserProfile = { 
                name: name.trim(), 
                gradeLevel,
                wakeWord: wakeWord.trim() || 'Mochi ơi'
            };
            onSubmit(profile);
        }
    };

    const isFormValid = name.trim() !== '' && gradeLevel !== '';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen font-sans bg-black p-4 text-white">
            <div className="w-full max-w-sm p-8 space-y-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Chào mừng bạn đến với Gia sư Mochi</h1>
                    <p className="mt-2 text-gray-400">Cho Mochi biết một chút về bạn để bắt đầu học nhé!</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">
                            Tên của bạn
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ví dụ: An"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="gradeLevel" className="block mb-2 text-sm font-medium text-gray-300">Trình độ học vấn</label>
                        <select
                            id="gradeLevel"
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Chọn lớp của bạn</option>
                            {gradeLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="wakeword" className="block mb-2 text-sm font-medium text-gray-300">
                            Từ khóa đánh thức (Tùy chọn)
                        </label>
                        <input
                            id="wakeword"
                            type="text"
                            value={wakeWord}
                            onChange={(e) => setWakeWord(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mặc định: Mochi ơi"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className={`w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg focus:ring-4 focus:outline-none transition-all duration-300
                            ${!isFormValid
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300'
                            }
                        `}
                    >
                        Bắt đầu học
                    </button>
                </form>
            </div>
        </div>
    );
};