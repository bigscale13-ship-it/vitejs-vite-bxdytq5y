import React, { useState, useEffect, useRef } from 'react';
import { Camera, MessageSquare, Globe, Settings, ChevronLeft, Battery, Wifi, Signal, X, Download } from 'lucide-react';

// --- AI API Utility (Mock) ---
const generateAIResponse = async (prompt, chatHistory = []) => {
  // APIを使用せず、1秒待機した後にサンプルの返答を返す
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`「${prompt}」ですね。承知いたしました。何か他にお手伝いできることはありますか？（※これはAPIを使用しないサンプルの返答です）`);
    }, 1000);
  });
};

// --- Apps ---

// 1. Camera App
const CameraApp = ({ onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // facingMode: "environment" でバックカメラを優先
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("カメラへのアクセスが許可されていないか、デバイスが見つかりません。");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // 高画質のJPG形式で画像データを生成
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageUrl);
    }
  };

  if (capturedImage) {
    return (
      <div className="flex flex-col h-full bg-black text-white relative">
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => setCapturedImage(null)} className="p-2 bg-black/50 rounded-full text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center overflow-hidden">
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        </div>
        <div className="h-24 bg-black flex items-center justify-center pb-4 absolute bottom-0 w-full bg-opacity-80">
          <a href={capturedImage} download="photo.jpg" className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full font-bold">
            <Download className="w-5 h-5" />
            <span>保存する</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      <div className="absolute top-4 left-4 z-50">
        <button onClick={handleClose} className="p-2 bg-black/50 rounded-full text-white active:bg-black/70">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-grow flex items-center justify-center overflow-hidden relative">
        {error ? (
          <div className="p-4 text-center text-red-400">{error}</div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="h-24 bg-black flex items-center justify-center pb-4 absolute bottom-0 w-full bg-opacity-50">
        <button 
          onClick={takePhoto}
          className="w-16 h-16 rounded-full border-4 border-white bg-white/20 active:bg-white/80 transition-colors"
        ></button>
      </div>
    </div>
  );
};

// 2. AI Assistant App
const AIAssistantApp = ({ onClose }) => {
  const [messages, setMessages] = useState([{ role: 'ai', content: 'こんにちは！WebOSのサポートAIです。何でも聞いてください。' }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const aiResponse = await generateAIResponse(userMsg, messages);
    
    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-700 text-slate-300">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-bold">AIアシスタント</span>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-slate-800 text-slate-200 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl bg-slate-800 text-slate-200 rounded-tl-sm flex space-x-2 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-slate-800 border-t border-slate-700 pb-6">
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-grow bg-slate-900 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50"
          >
             ↑
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Browser App
const BrowserApp = ({ onClose }) => {
  // 初期ページをGoogleに設定 (iframeで表示しやすくするためのパラメータ付き)
  const [inputUrl, setInputUrl] = useState("https://www.google.com/webhp?igu=1");
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com/webhp?igu=1");

  const handleNavigate = (e) => {
    e.preventDefault();
    let query = inputUrl.trim();
    if (!query) return;
    
    // 入力がURL形式かどうかを判定
    const isUrl = /^https?:\/\//i.test(query) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(query);

    if (isUrl) {
      let urlToNavigate = query;
      // http/httpsがなければ補完
      if (!/^https?:\/\//i.test(urlToNavigate)) {
        urlToNavigate = `https://${urlToNavigate}`;
      }
      setCurrentUrl(urlToNavigate);
      setInputUrl(urlToNavigate);
    } else {
      // URLでなければGoogle検索を実行
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
      setCurrentUrl(searchUrl);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black">
      <div className="bg-slate-100 p-2 flex items-center space-x-2 border-b border-slate-300">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <form onSubmit={handleNavigate} className="flex-grow bg-white rounded-full flex items-center px-3 py-1 border border-slate-300 shadow-inner">
          <Globe className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full text-sm outline-none bg-transparent"
            placeholder="検索またはURLを入力"
          />
        </form>
      </div>
      <div className="flex-grow relative bg-slate-50">
        <iframe 
          src={currentUrl} 
          className="w-full h-full border-none bg-white"
          title="Virtual Browser"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white text-[10px] p-2 rounded-xl pointer-events-none text-center shadow-lg opacity-80">
          ※外部サイトのセキュリティ設定(X-Frame-Options等)により、表示がブロックされるページがあります。
        </div>
      </div>
    </div>
  );
};

// 4. Settings App
const SettingsApp = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">設定</h1>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <span className="font-medium">機内モード</span>
            <div className="w-10 h-6 bg-slate-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
            </div>
          </div>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <span className="font-medium">Wi-Fi</span>
            <span className="text-slate-500 text-sm">接続済み</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="font-medium">Bluetooth</span>
            <span className="text-slate-500 text-sm">オン</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <span className="font-medium">OS情報</span>
            <p className="text-xs text-slate-500 mt-1">WebOS v1.0.0 (Build 2026)</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- System Components ---

const APPS = [
  { id: 'camera', name: 'カメラ', icon: Camera, color: 'bg-yellow-500', component: CameraApp },
  { id: 'ai', name: 'AIアシスタント', icon: MessageSquare, color: 'bg-blue-500', component: AIAssistantApp },
  { id: 'browser', name: 'ブラウザ', icon: Globe, color: 'bg-green-500', component: BrowserApp },
  { id: 'settings', name: '設定', icon: Settings, color: 'bg-slate-500', component: SettingsApp },
];

export default function App() {
  const [activeApp, setActiveApp] = useState(null);
  const [time, setTime] = useState(new Date());

  // Tailwind CSSの動的読み込みと時計の更新
  useEffect(() => {
    // CDNからTailwindを自動で読み込む
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenApp = (appId) => {
    setActiveApp(appId);
  };

  const handleCloseApp = () => {
    setActiveApp(null);
  };

  const ActiveComponent = activeApp ? APPS.find(a => a.id === activeApp)?.component : null;
  const activeAppColor = activeApp ? 'text-black' : 'text-white';

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* 仮想スマートフォンの外枠 (デバイスベゼル) */}
      <div className="relative w-full max-w-[380px] h-[800px] max-h-[90vh] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-neutral-800 overflow-hidden ring-1 ring-white/10">
        
        {/* インナーベゼルとスクリーン */}
        <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-inner">
          
          {/* 背景画像 (ホーム画面用) */}
          {!activeApp && (
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-80"></div>
               {/* 装飾的なぼかし円 */}
               <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>
          )}

          {/* ステータスバー */}
          <div className={`h-8 w-full flex justify-between items-center px-6 text-xs font-medium z-50 ${activeAppColor} transition-colors duration-300 absolute top-0 left-0 bg-gradient-to-b from-black/40 to-transparent`}>
            <span>{formatTime(time)}</span>
            
            {/* ノッチ / ダイナミックアイランド風 */}
            <div className="absolute left-1/2 top-1 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
                <div className="w-1 h-1 rounded-full bg-blue-900/50"></div>
            </div>

            <div className="flex space-x-2 items-center">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* メインコンテンツエリア */}
          <div className="flex-grow pt-8 relative z-10 flex flex-col">
            
            {/* ホーム画面 */}
            <div className={`flex-grow p-6 transition-all duration-300 ${activeApp ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100'}`}>
              <div className="grid grid-cols-4 gap-4 mt-8">
                {APPS.map((app) => (
                  <div key={app.id} className="flex flex-col items-center group">
                    <button 
                      onClick={() => handleOpenApp(app.id)}
                      className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center shadow-lg transform active:scale-90 transition-all duration-200 group-hover:shadow-xl`}
                    >
                      <app.icon className="w-7 h-7 text-white" />
                    </button>
                    <span className="text-[10px] text-white mt-2 font-medium tracking-wide drop-shadow-md">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* アプリウィンドウ */}
            <div className={`absolute inset-0 bg-white transition-all duration-300 z-20 flex flex-col ${activeApp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
              
              {/* アプリ内ヘッダー (ステータスバーの領域を確保) */}
              <div className="h-8 bg-transparent pointer-events-none"></div>
              
              {/* アプリコンテンツ */}
              <div className="flex-grow overflow-hidden relative">
                {ActiveComponent && <ActiveComponent onClose={handleCloseApp} />}
              </div>
            </div>

          </div>

          {/* ホームインジケーター (スワイプアップでホームに戻る想定のUI) */}
          <div className="h-6 w-full absolute bottom-0 z-50 flex justify-center items-center cursor-pointer group pb-2" onClick={handleCloseApp}>
             <div className="w-1/3 h-1 bg-white/50 group-hover:bg-white rounded-full transition-colors"></div>
          </div>

        </div>
      </div>
      
      {/* 操作ヒント */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col space-y-4 text-neutral-400 max-w-xs bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700/50">
        <h3 className="text-white font-bold mb-2">WebOS Prototype</h3>
        <p className="text-sm">端末やOSに依存しない仮想スマートフォンの概念実証です。</p>
        <ul className="text-sm space-y-2 list-disc pl-4">
            <li><strong>AIアシスタント:</strong> 内蔵LLM APIと通信し、コンテキストを保持して会話します。</li>
            <li><strong>カメラ:</strong> ブラウザのMediaDevices API経由で実際のデバイスのカメラにアクセスします。</li>
            <li><strong>操作:</strong> 画面下部の白いバーをクリックするか、各アプリ左上の戻るボタンでホームに戻ります。</li>
        </ul>
      </div>
    </div>
  );
}