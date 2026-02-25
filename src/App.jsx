import React, { useState, useEffect, useRef } from 'react';
import { Camera, MessageSquare, Globe, Settings, ChevronLeft, Battery, Wifi, Signal, X, Download, Images, Check, Plus } from 'lucide-react';

// --- AI API Utility (Mock) ---
const generateAIResponse = async (prompt, chatHistory = []) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`「${prompt}」ですね。承知いたしました。何か他にお手伝いできることはありますか？（※これはAPIを使用しないサンプルの返答です）`);
    }, 1000);
  });
};

// --- Apps ---

// 1. Camera App
const CameraApp = ({ onClose, setPhotos }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
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
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageUrl);
      
      if (setPhotos) {
        setPhotos(prev => [imageUrl, ...prev]);
      }
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

// 2. Gallery App
const GalleryApp = ({ onClose, photos }) => {
  const [viewImage, setViewImage] = useState(null);

  if (viewImage) {
    return (
      <div className="flex flex-col h-full bg-black text-white relative">
        <div className="absolute top-4 left-4 z-50">
          <button onClick={() => setViewImage(null)} className="p-2 bg-black/50 rounded-full text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center overflow-hidden">
          <img src={viewImage} alt="Viewed" className="w-full h-full object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white text-black relative">
      <div className="bg-slate-100 p-2 flex items-center space-x-2 border-b border-slate-300">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">写真</h1>
      </div>
      <div className="flex-grow overflow-y-auto p-1 bg-white">
        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo, idx) => (
              <div key={idx} className="aspect-square bg-slate-200 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setViewImage(photo)}>
                <img src={photo} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <Images className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-sm">写真がありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. AI Assistant App
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
    
    if (document.activeElement) {
      document.activeElement.blur();
    }

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

// 4. Browser App
const BrowserApp = ({ onClose }) => {
  const [inputUrl, setInputUrl] = useState("https://www.google.com/webhp?igu=1");
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com/webhp?igu=1");

  const handleNavigate = (e) => {
    e.preventDefault();
    
    if (document.activeElement) {
      document.activeElement.blur();
    }

    let query = inputUrl.trim();
    if (!query) return;
    
    const isUrl = /^https?:\/\//i.test(query) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(query);

    if (isUrl) {
      let urlToNavigate = query;
      if (!/^https?:\/\//i.test(urlToNavigate)) {
        urlToNavigate = `https://${urlToNavigate}`;
      }
      setCurrentUrl(urlToNavigate);
      setInputUrl(urlToNavigate);
    } else {
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

// 5. Settings App
const SettingsApp = ({ onClose, currentWallpaper, setWallpaper, aiCustomIcon, setAiCustomIcon }) => {
  const wallpaperInputRef = useRef(null);
  const aiIconInputRef = useRef(null);

  const wallpapers = [
    { id: 'default', name: 'デフォルト', style: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900' },
    { id: 'ocean', name: 'オーシャン', style: 'bg-gradient-to-br from-blue-500 to-cyan-300' },
    { id: 'sunset', name: 'サンセット', style: 'bg-gradient-to-br from-orange-500 to-pink-500' },
    { id: 'forest', name: 'フォレスト', style: 'bg-gradient-to-br from-green-500 to-emerald-700' },
    { id: 'dark', name: 'ダーク', style: 'bg-slate-900' },
  ];

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result); // Base64化された画像データをセット
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">設定</h1>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        
        {/* 壁紙設定 */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 mb-2 px-1">壁紙</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
              {wallpapers.map((wp) => (
                <div key={wp.id} className="flex flex-col items-center">
                  <button 
                    onClick={() => setWallpaper(wp.style)}
                    className={`w-10 h-10 rounded-full ${wp.style} border-2 flex items-center justify-center transition-transform active:scale-90 ${currentWallpaper === wp.style ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    {currentWallpaper === wp.style && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                  </button>
                  <span className="text-[10px] text-slate-500 mt-1">{wp.name}</span>
                </div>
              ))}
              {/* カスタム壁紙追加ボタン */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => wallpaperInputRef.current?.click()}
                  className={`w-10 h-10 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center transition-transform active:scale-90 ${currentWallpaper?.startsWith('data:image') ? 'border-blue-500 border-solid' : 'hover:border-slate-400'}`}
                >
                  {currentWallpaper?.startsWith('data:image') ? (
                    <Check className="w-5 h-5 text-blue-500 drop-shadow-md" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <span className="text-[10px] text-slate-500 mt-1">追加</span>
                <input 
                  type="file" 
                  ref={wallpaperInputRef} 
                  onChange={(e) => handleFileUpload(e, setWallpaper)} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* AIアイコン設定 */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 mb-2 px-1">AIアシスタントアイコン</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                {aiCustomIcon ? (
                  <img src={aiCustomIcon} alt="Custom AI Icon" className="w-full h-full object-cover" />
                ) : (
                  <MessageSquare className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => aiIconInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-lg transition-colors text-slate-700"
                >
                  画像を選択
                </button>
                {aiCustomIcon && (
                  <button 
                    onClick={() => setAiCustomIcon(null)}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors text-left"
                  >
                    デフォルトに戻す
                  </button>
                )}
                <input 
                  type="file" 
                  ref={aiIconInputRef} 
                  onChange={(e) => handleFileUpload(e, setAiCustomIcon)} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ネットワーク設定 */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 mb-2 px-1">ネットワーク</h2>
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
        </div>
        
        {/* システム情報 */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 mb-2 px-1">システム</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <span className="font-medium">OS情報</span>
              <p className="text-xs text-slate-500 mt-1">WebOS v1.0.0 (Build 2026)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- System Components ---

const APPS = [
  { id: 'camera', name: 'カメラ', icon: Camera, color: 'bg-yellow-500', component: CameraApp },
  { id: 'gallery', name: '写真', icon: Images, color: 'bg-purple-500', component: GalleryApp },
  { id: 'ai', name: 'AIアシスタント', icon: MessageSquare, color: 'bg-blue-500', component: AIAssistantApp },
  { id: 'browser', name: 'ブラウザ', icon: Globe, color: 'bg-green-500', component: BrowserApp },
  { id: 'settings', name: '設定', icon: Settings, color: 'bg-slate-500', component: SettingsApp },
];

export default function App() {
  const [activeApp, setActiveApp] = useState(null);
  const [time, setTime] = useState(new Date());
  
  // OS全体で共有するデータ
  const [photos, setPhotos] = useState([]);
  const [wallpaper, setWallpaper] = useState('bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900');
  const [aiCustomIcon, setAiCustomIcon] = useState(null);

  useEffect(() => {
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
  const isImageWallpaper = wallpaper.startsWith('data:image');

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* 仮想スマートフォンの外枠 */}
      <div className="relative w-full max-w-[380px] h-[800px] max-h-[90vh] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-neutral-800 overflow-hidden ring-1 ring-white/10">
        
        {/* インナーベゼルとスクリーン */}
        <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-inner">
          
          {/* 背景画像 (ホーム画面用) */}
          {!activeApp && (
            <div className="absolute inset-0 z-0">
               <div 
                 className={`absolute inset-0 opacity-90 transition-all duration-500 ${!isImageWallpaper ? wallpaper : 'bg-cover bg-center'}`}
                 style={isImageWallpaper ? { backgroundImage: `url(${wallpaper})` } : {}}
               ></div>
               {/* 装飾的なぼかし円 */}
               <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-black/20 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
            </div>
          )}

          {/* ステータスバー */}
          <div className={`h-8 w-full flex justify-between items-center px-6 text-xs font-medium z-50 ${activeAppColor} transition-colors duration-300 absolute top-0 left-0 bg-gradient-to-b from-black/40 to-transparent`}>
            <span>{formatTime(time)}</span>
            
            <div className="absolute left-1/2 top-1 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 flex items-center justify-center shadow-md">
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
                      className={`w-14 h-14 ${app.id === 'ai' && aiCustomIcon ? '' : app.color} rounded-2xl flex items-center justify-center shadow-lg transform active:scale-90 transition-all duration-200 group-hover:shadow-xl overflow-hidden`}
                    >
                      {app.id === 'ai' && aiCustomIcon ? (
                        <img src={aiCustomIcon} alt="AI Custom Icon" className="w-full h-full object-cover" />
                      ) : (
                        <app.icon className="w-7 h-7 text-white" />
                      )}
                    </button>
                    <span className="text-[10px] text-white mt-2 font-medium tracking-wide drop-shadow-md">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* アプリウィンドウ */}
            <div className={`absolute inset-0 bg-white transition-all duration-300 z-20 flex flex-col ${activeApp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
              
              <div className="h-8 bg-transparent pointer-events-none"></div>
              
              <div className="flex-grow overflow-hidden relative">
                {ActiveComponent && (
                  <ActiveComponent 
                    onClose={handleCloseApp} 
                    photos={photos} 
                    setPhotos={setPhotos} 
                    currentWallpaper={wallpaper}
                    setWallpaper={setWallpaper}
                    aiCustomIcon={aiCustomIcon}
                    setAiCustomIcon={setAiCustomIcon}
                  />
                )}
              </div>
            </div>

          </div>

          {/* ホームインジケーター */}
          <div className="h-6 w-full absolute bottom-0 z-50 flex justify-center items-center cursor-pointer group pb-2" onClick={handleCloseApp}>
             <div className="w-1/3 h-1 bg-white/50 group-hover:bg-white rounded-full transition-colors drop-shadow-md"></div>
          </div>

        </div>
      </div>
      
    </div>
  );
}