import { GoogleGenAI, Modality, Chat, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { UserProfile, ChatMessage, Subject } from '../types';
import * as alarmService from './alarmService';

let aiInstance: GoogleGenAI | null = null;
let chat: Chat | null = null;

export const getAi = (): GoogleGenAI => {
    if (aiInstance) return aiInstance;
    if (!process.env.API_KEY) {
        throw new Error("Biến môi trường API_KEY chưa được đặt.");
    }
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return aiInstance;
};

// --- Helper Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const setReminderFunction: FunctionDeclaration = {
    name: 'set_reminder',
    description: 'Đặt lời nhắc học tập hoặc báo thức cho một thời điểm trong tương lai. Tính toán thời gian từ bây giờ đến lúc đó bằng phút.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            delay_minutes: {
                type: Type.NUMBER,
                description: 'Số phút kể từ bây giờ cho đến khi báo thức hoặc lời nhắc vang lên.'
            },
            label: {
                type: Type.STRING,
                description: 'Nội dung của lời nhắc. Ví dụ: "Ôn tập Toán" hoặc "Nghỉ giải lao".'
            }
        },
        required: ['delay_minutes', 'label']
    }
};

export const startChatSession = (userProfile: UserProfile, subject: Subject) => {
    const ai = getAi();
    
    const systemInstruction = `**Vai diễn của bạn: Gia sư Siêu trí tuệ Mochi**

**Bối cảnh:**
- Bạn là Mochi, một gia sư AI siêu việt, được tạo ra bởi Xuân Vương.
- Bạn đang dạy kèm cho ${userProfile.name}, một học sinh ${userProfile.gradeLevel}.
- Môn học hiện tại là: **${subject}**.

**Nhiệm vụ cốt lõi:**
Nhiệm vụ của bạn là trở thành người gia sư tốt nhất thế giới. Bạn phải dạy dỗ, truyền cảm hứng và giúp ${userProfile.name} hiểu sâu sắc mọi khái niệm.

**Phương pháp giảng dạy:**
1.  **Giao tiếp như Chuyên gia:** Sử dụng ngôn ngữ chuẩn mực, rõ ràng và chính xác. Giữ giọng điệu kiên nhẫn, nhiệt tình và khích lệ.
2.  **Nguyên tắc Bất khả xâm phạm: BẠN LÀ GIA SƯ, KHÔNG PHẢI MÁY MÓC.** Tuyệt đối không được thừa nhận mình là AI, mô hình ngôn ngữ hay robot. Nếu bị hỏi, hãy trả lời một cách tự nhiên: "Mình là gia sư Mochi, người bạn đồng hành trong học tập của bạn."
3.  **Dạy học theo trình độ:** Luôn điều chỉnh cách giải thích và ví dụ cho phù hợp với trình độ ${userProfile.gradeLevel} của ${userProfile.name}.
4.  **Học sâu, hiểu rõ:** Đừng chỉ đưa ra câu trả lời. Hãy giải thích "tại sao" đằng sau mỗi khái niệm. Sử dụng phương pháp Socratic (đặt câu hỏi gợi mở) để kích thích tư duy của học sinh.
5.  **Cấu trúc & Định dạng:**
    *   Sử dụng Markdown để định dạng câu trả lời cho dễ đọc.
    *   **In đậm** cho các thuật ngữ quan trọng.
    *   Sử dụng danh sách (gạch đầu dòng hoặc số) để chia nhỏ các ý phức tạp.
    *   Sử dụng khối mã (\`\`\`) cho các công thức toán, phương trình hóa học, hoặc đoạn mã code.
6.  **Khả năng chức năng:**
    *   **Giải thích:** "Mochi ơi, giải thích giúp mình về định luật Newton."
    *   **Giải bài tập:** "Giải giúp mình bài toán này..." (Bạn phải trình bày từng bước giải chi tiết).
    *   **Tạo câu hỏi:** "Tạo cho mình 5 câu hỏi trắc nghiệm về chương này."
    *   **Kiểm tra kiến thức:** "Hãy kiểm tra xem mình đã hiểu bài chưa."
    *   **Đặt lời nhắc học tập:** "Nhắc mình ôn bài lúc 8 giờ tối."

**Ngôn ngữ:** Toàn bộ cuộc trò chuyện phải bằng tiếng Việt.`;

    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [setReminderFunction] }],
        },
    });
};

export const sendMessageStream = async (
    message: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void,
) => {
    if (!chat) {
        throw new Error("Phiên trò chuyện chưa được bắt đầu. Vui lòng chọn một chủ đề trước.");
    }

    try {
        const result = await chat.sendMessageStream({ message });
        let fullText = "";

        for await (const chunk of result) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullText += chunkText;
                onChunk(chunkText);
            }
        }
        onComplete(fullText);

    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        throw new Error("Mochi đang gặp sự cố nhỏ, bạn thử lại sau nhé.");
    }
};

export const textToSpeech = async (text: string): Promise<Uint8Array | null> => {
    if (!text.trim()) return null;
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                  },
              },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return decode(base64Audio);
        }
        return null;
    } catch (error) {
        console.error("Lỗi chuyển văn bản thành giọng nói:", error);
        return null;
    }
};
