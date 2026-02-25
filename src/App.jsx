import React, { useState, useEffect, useRef } from 'react';
import { Camera, MessageSquare, Globe, Settings, ChevronLeft, Battery, Wifi, Signal, X, Download, Images, Check, Plus, Clock, Calendar, Mail, Map as MapIcon, Calculator, Phone, Users, FileText, Search, ChevronDown, Smartphone, HardDrive, Volume2, Lock, User, Info, ChevronRight, Palette, Sparkles, Bluetooth, MapPin, Edit3 } from 'lucide-react';

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
        console.warn("Camera init failed (No device or permission denied).");
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
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
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

      <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
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
  const [view, setView] = useState('main');
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
        setter(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, hasArrow = false, toggle = null }) => (
    <div 
      className={`px-4 py-3 bg-white flex items-center border-b border-slate-100 ${onClick ? 'cursor-pointer active:bg-slate-50' : ''}`}
      onClick={onClick}
    >
      <div className="w-8 flex justify-center text-slate-500 mr-3 shrink-0">
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-grow min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">{title}</div>
        {subtitle && <div className="text-[11px] text-slate-500 truncate mt-0.5">{subtitle}</div>}
      </div>
      {toggle !== null && (
        <div className="shrink-0 ml-2">
           <div className={`w-9 h-5 rounded-full relative ${toggle ? 'bg-blue-500' : 'bg-slate-300'}`}>
             <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${toggle ? 'left-[18px]' : 'left-0.5'}`}></div>
           </div>
        </div>
      )}
      {hasArrow && (
        <div className="shrink-0 ml-2 text-slate-400">
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  const renderMainSettings = () => (
    <div className="pb-6">
       <div className="h-2"></div>
       <SettingItem icon={Wifi} title="ネットワークとインターネット" subtitle="Wi-Fi, モバイル, データ使用量" />
       <SettingItem icon={Bluetooth} title="接続済みのデバイス" subtitle="Bluetooth, キャスト" />
       <div className="h-2 bg-slate-50"></div>
       <SettingItem icon={Palette} title="壁紙とスタイル" subtitle="壁紙、テーマカラーの変更" onClick={() => setView('display')} hasArrow />
       <SettingItem icon={Sparkles} title="AIアシスタント" subtitle="アイコンや動作の設定" onClick={() => setView('ai')} hasArrow />
       <div className="h-2 bg-slate-50"></div>
       <SettingItem icon={Battery} title="バッテリー" subtitle="85% - 残り約12時間" />
       <SettingItem icon={HardDrive} title="ストレージ" subtitle="45% 使用済み - 64GB中" />
       <SettingItem icon={Volume2} title="音とバイブレーション" subtitle="着信音、サイレントモード" />
       <div className="h-2 bg-slate-50"></div>
       <SettingItem icon={Lock} title="セキュリティとプライバシー" subtitle="画面ロック、顔認証" />
       <SettingItem icon={User} title="パスワードとアカウント" subtitle="Google, 保存済みパスワード" />
       <div className="h-2 bg-slate-50"></div>
       <SettingItem icon={Info} title="システム" subtitle="言語、ジェスチャー、日付と時刻" />
       <SettingItem icon={Smartphone} title="About emulated device" subtitle="WebOS v1.0.0" onClick={() => setView('about')} hasArrow />
    </div>
  );

  const renderAboutSettings = () => (
    <div className="pb-6">
      <div className="flex flex-col items-center py-8 bg-slate-50 border-b border-slate-200">
         <Smartphone className="w-12 h-12 text-slate-400 mb-2" />
         <h2 className="text-xl font-light">Emulated Device</h2>
      </div>
      <div className="bg-white">
         <SettingItem title="Device name" subtitle="WebOS Virtual Phone" />
         <SettingItem title="Model" subtitle="WebOS-Pro-2026" />
         <SettingItem title="Android version" subtitle="14 (WebOS Subsystem)" />
         <SettingItem title="SIM status" subtitle="Network: VirtualNet / Status: In Service" />
         <SettingItem title="IP address" subtitle="192.168.1.100" />
         <SettingItem title="Wi-Fi MAC address" subtitle="02:00:00:00:00:00" />
         <SettingItem title="Bluetooth address" subtitle="Unavailable" />
         <SettingItem title="Up time" subtitle="102:45:12" />
         <SettingItem title="Build number" subtitle="WEBOS.1.0.0.BETA-20260226" />
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="p-4 space-y-6 bg-slate-50 h-full">
      <div>
        <h2 className="text-xs font-bold text-slate-500 mb-2 px-1 uppercase tracking-wider">壁紙の選択</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {wallpapers.map((wp) => (
              <div key={wp.id} className="flex flex-col items-center">
                <button 
                  onClick={() => setWallpaper(wp.style)}
                  className={`w-10 h-10 rounded-full ${wp.style} border-2 flex items-center justify-center transition-transform active:scale-90 ${currentWallpaper === wp.style ? 'border-blue-500' : 'border-transparent'}`}
                >
                  {currentWallpaper === wp.style && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                </button>
                <span className="text-[10px] text-slate-500 mt-1 truncate w-full text-center">{wp.name}</span>
              </div>
            ))}
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
              <input type="file" ref={wallpaperInputRef} onChange={(e) => handleFileUpload(e, setWallpaper)} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="p-4 space-y-6 bg-slate-50 h-full">
      <div>
        <h2 className="text-xs font-bold text-slate-500 mb-2 px-1 uppercase tracking-wider">AIアシスタントアイコン</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm">
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
              <input type="file" ref={aiIconInputRef} onChange={(e) => handleFileUpload(e, setAiCustomIcon)} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center shrink-0 shadow-sm z-10">
        <button onClick={() => view === 'main' ? onClose() : setView('main')} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium ml-1">
          {view === 'main' ? '設定' : 
           view === 'display' ? '壁紙とスタイル' : 
           view === 'ai' ? 'AIアシスタント設定' : 
           'About emulated device'}
        </h1>
      </div>
      <div className="flex-grow overflow-y-auto">
        {view === 'main' && renderMainSettings()}
        {view === 'display' && renderDisplaySettings()}
        {view === 'ai' && renderAISettings()}
        {view === 'about' && renderAboutSettings()}
      </div>
    </div>
  );
};

// 6. Clock App
const ClockApp = ({ onClose }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-4 flex items-center border-b border-slate-800">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-800 text-slate-300">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">時計</h1>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-6xl font-light tracking-wider tabular-nums">
          {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-slate-400 mt-4 text-sm">
          {time.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>
    </div>
  );
};

// 7. Calendar App
const CalendarApp = ({ onClose }) => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center shadow-sm">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">2月 2026</h1>
      </div>
      <div className="flex-grow p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({length: 28}).map((_, i) => (
            <div key={i} className={`p-2 rounded-full flex items-center justify-center aspect-square ${i+1 === 26 ? 'bg-red-500 text-white font-bold' : 'text-slate-700'}`}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 8. Mail App
const MailApp = ({ onClose }) => {
  const mails = [
    { sender: 'Apple', subject: '領収書', preview: 'App Storeでの購入ありがとうございます。', time: '10:00' },
    { sender: 'GitHub', subject: 'New login', preview: 'A new login was detected on your account.', time: '昨日' },
    { sender: 'Slack', subject: 'Missed messages', preview: 'You have 3 unread messages in #general.', time: '昨日' },
  ];
  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center shadow-sm">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">受信トレイ</h1>
      </div>
      <div className="flex-grow overflow-y-auto">
        {mails.map((m, i) => (
          <div key={i} className="p-4 border-b border-slate-100 active:bg-slate-50 cursor-pointer">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-sm">{m.sender}</span>
              <span className="text-xs text-slate-500">{m.time}</span>
            </div>
            <div className="text-sm font-medium">{m.subject}</div>
            <div className="text-xs text-slate-500 truncate">{m.preview}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Map App
const MapApp = ({ onClose }) => (
  <div className="flex flex-col h-full bg-[#e5e3df] text-slate-900 relative overflow-hidden">
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center">
      <button onClick={onClose} className="p-2 mr-2 rounded-full bg-white shadow-md text-slate-600 active:bg-slate-100">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex-grow bg-white rounded-full shadow-md p-2 px-4 flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <span className="text-sm text-slate-400">場所を検索...</span>
      </div>
    </div>
    <div className="absolute inset-0 opacity-50 pointer-events-none">
      <div className="absolute top-1/2 left-0 w-full h-4 bg-white transform -translate-y-1/2 rotate-12"></div>
      <div className="absolute top-0 left-1/3 w-4 h-full bg-white transform -rotate-12"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#b5d5b5] rounded-3xl opacity-60"></div>
    </div>
    <div className="flex-grow flex items-center justify-center relative z-0">
      <div className="relative animate-bounce">
        <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="white" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
      </div>
    </div>
  </div>
);

// 10. Calculator App
const CalculatorApp = ({ onClose }) => {
  const buttons = ['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];
  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="p-4 flex items-center">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-neutral-800 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-grow flex flex-col justify-end p-4 pb-8">
        <div className="text-right text-6xl font-light mb-6 px-2">0</div>
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((b, i) => (
            <button key={i} className={`h-16 rounded-full flex items-center justify-center text-2xl font-normal active:opacity-70 transition-opacity
              ${['÷', '×', '-', '+', '='].includes(b) ? 'bg-orange-500 text-white' : 
                ['C', '±', '%'].includes(b) ? 'bg-neutral-300 text-black font-medium' : 
                b === '0' ? 'bg-neutral-800 col-span-2 justify-start pl-7' : 'bg-neutral-800 text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 11. Phone App
const PhoneApp = ({ onClose }) => {
  const keys = [
    { num: '1', sub: '' }, { num: '2', sub: 'ABC' }, { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' }, { num: '5', sub: 'JKL' }, { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' }, { num: '8', sub: 'TUV' }, { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' }, { num: '0', sub: '+' }, { num: '#', sub: '' }
  ];
  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      <div className="p-4 bg-white flex items-center">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-grow flex flex-col justify-end items-center pb-12 px-8">
        <div className="h-16 text-4xl font-light mb-6 text-center w-full tracking-wider"></div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-[280px]">
          {keys.map((k, i) => (
            <button key={i} className="w-[70px] h-[70px] rounded-full bg-slate-100 flex flex-col items-center justify-center active:bg-slate-200 transition-colors mx-auto">
              <span className="text-3xl font-light leading-none">{k.num}</span>
              {k.sub && <span className="text-[9px] font-bold text-slate-500 tracking-widest mt-1">{k.sub}</span>}
            </button>
          ))}
        </div>
        <div className="mt-8">
          <button className="w-[70px] h-[70px] rounded-full bg-green-500 flex items-center justify-center active:bg-green-600 transition-colors shadow-md">
            <Phone className="w-8 h-8 text-white fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 12. Contacts App
const ContactsApp = ({ onClose }) => {
  const contacts = ['伊藤', '佐藤', '鈴木', '高橋', '田中', '渡辺', '山本'];
  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center shadow-sm">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-100 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">連絡先</h1>
      </div>
      <div className="p-4 border-b border-slate-100">
        <div className="bg-slate-100 rounded-lg p-2 flex items-center">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm text-slate-400">検索</span>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {contacts.map((c, i) => (
          <div key={i} className="flex items-center p-3 border-b border-slate-50 active:bg-slate-50 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4 text-lg">
              {c[0]}
            </div>
            <div className="text-base font-medium">{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 13. Notes App
const NotesApp = ({ onClose }) => {
  const notes = [
    { title: '買い物リスト', date: '今日', preview: '牛乳、卵、パン...' },
    { title: 'ミーティングメモ', date: '昨日', preview: '次回のリリースについて...' },
    { title: 'アイディア', date: '2/20', preview: '新しいアプリのUI設計...' },
  ];
  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] text-slate-900 relative">
      <div className="p-4 border-b border-slate-200/50 flex items-center bg-[#fdfbf7]">
        <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-slate-200 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">メモ</h1>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50">
            <div className="font-bold text-base mb-1">{n.title}</div>
            <div className="text-xs text-slate-500 mb-2">{n.date}</div>
            <div className="text-sm text-slate-600 truncate">{n.preview}</div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 right-6">
        <button className="w-14 h-14 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Edit3 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// --- System Components ---

const APPS = [
  // ホーム＆ドロワーに表示する基本アプリ
  { id: 'camera', name: 'カメラ', icon: Camera, color: 'bg-yellow-500', component: CameraApp, inHome: true },
  { id: 'gallery', name: '写真', icon: Images, color: 'bg-purple-500', component: GalleryApp, inHome: true },
  { id: 'ai', name: 'AI', icon: MessageSquare, color: 'bg-blue-500', component: AIAssistantApp, inHome: true },
  { id: 'browser', name: 'ブラウザ', icon: Globe, color: 'bg-green-500', component: BrowserApp, inHome: true },
  { id: 'settings', name: '設定', icon: Settings, color: 'bg-slate-500', component: SettingsApp, inHome: true },
  
  // ドロワー(アプリ一覧)にのみ表示する追加アプリ
  { id: 'clock', name: '時計', icon: Clock, color: 'bg-indigo-500', component: ClockApp, inHome: false },
  { id: 'calendar', name: 'カレンダー', icon: Calendar, color: 'bg-red-500', component: CalendarApp, inHome: false },
  { id: 'mail', name: 'メール', icon: Mail, color: 'bg-blue-400', component: MailApp, inHome: false },
  { id: 'map', name: 'マップ', icon: MapIcon, color: 'bg-green-600', component: MapApp, inHome: false },
  { id: 'calculator', name: '電卓', icon: Calculator, color: 'bg-orange-500', component: CalculatorApp, inHome: false },
  { id: 'phone', name: '電話', icon: Phone, color: 'bg-green-400', component: PhoneApp, inHome: false },
  { id: 'contacts', name: '連絡先', icon: Users, color: 'bg-indigo-400', component: ContactsApp, inHome: false },
  { id: 'notes', name: 'メモ', icon: FileText, color: 'bg-yellow-400', component: NotesApp, inHome: false },
];

export default function App() {
  const [activeApp, setActiveApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [time, setTime] = useState(new Date());
  
  const [photos, setPhotos] = useState([]);
  const [wallpaper, setWallpaper] = useState('bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900');
  const [aiCustomIcon, setAiCustomIcon] = useState(null);

  // スワイプ検知用の状態
  const [startY, setStartY] = useState(null);

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
    setIsDrawerOpen(false); // アプリを開いたらドロワーを閉じる
  };

  const handleHomeAction = () => {
    if (activeApp) {
      setActiveApp(null);
    } else if (isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  };

  // スワイプ・ドラッグのハンドリング (タッチとマウスを分離して検知)
  const handleDragStart = (e) => {
    if (activeApp) return; // アプリ起動中は無効化
    // タッチの場合は e.touches[0]、マウスの場合は e を参照
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
  };

  const handleDragEnd = (e) => {
    if (activeApp || startY === null) return; // アプリ起動中は無効化
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const diff = startY - clientY;

    // 上スワイプ (50px以上) 
    if (diff > 50 && !isDrawerOpen) {
      setIsDrawerOpen(true);
    } 
    // 下スワイプ (-50px以下) で閉じる
    else if (diff < -50 && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
    setStartY(null);
  };

  const activeAppObj = APPS.find(a => a.id === activeApp);
  const ActiveComponent = activeAppObj?.component;
  const activeAppColor = activeApp ? 'text-black' : 'text-white';
  const isImageWallpaper = wallpaper.startsWith('data:image');
  
  // 検索フィルタリング
  const filteredApps = APPS.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* 仮想スマートフォンの外枠 */}
      <div className="relative w-full max-w-[380px] h-[800px] max-h-[90vh] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-neutral-800 overflow-hidden ring-1 ring-white/10">
        
        {/* インナーベゼルとスクリーン */}
        <div 
          className="relative w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-inner select-none"
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          
          {/* 背景画像 (ホーム画面用) */}
          {!activeApp && (
            <div className="absolute inset-0 z-0">
               <div 
                 className={`absolute inset-0 opacity-90 transition-all duration-500 ${!isImageWallpaper ? wallpaper : 'bg-cover bg-center'}`}
                 style={isImageWallpaper ? { backgroundImage: `url(${wallpaper})` } : {}}
               ></div>
               <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50 pointer-events-none"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-black/20 rounded-full mix-blend-overlay filter blur-3xl opacity-50 pointer-events-none"></div>
            </div>
          )}

          {/* ステータスバー */}
          <div className={`h-8 w-full flex justify-between items-center px-6 text-xs font-medium z-50 ${isDrawerOpen ? 'text-black' : activeAppColor} transition-colors duration-300 absolute top-0 left-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none`}>
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
            <div className={`flex-grow p-6 transition-all duration-300 ${activeApp || isDrawerOpen ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100'}`}>
              <div className="grid grid-cols-4 gap-y-6 gap-x-4 mt-8">
                {APPS.filter(app => app.inHome).map((app) => (
                  <div key={app.id} className="flex flex-col items-center group">
                    <button 
                      onClick={() => handleOpenApp(app.id)}
                      className={`w-14 h-14 ${app.id === 'ai' && aiCustomIcon ? '' : app.color} rounded-2xl flex items-center justify-center shadow-lg transform active:scale-90 transition-all duration-200 overflow-hidden`}
                    >
                      {app.id === 'ai' && aiCustomIcon ? (
                        <img src={aiCustomIcon} alt="AI Custom Icon" className="w-full h-full object-cover" />
                      ) : (
                        <app.icon className="w-7 h-7 text-white" />
                      )}
                    </button>
                    <span className="text-[10px] text-white mt-2 font-medium tracking-wide drop-shadow-md truncate w-full text-center">{app.name}</span>
                  </div>
                ))}
              </div>
              
              {/* スワイプヒント */}
              <div className="absolute bottom-10 left-0 w-full flex flex-col items-center justify-center text-white/70 animate-bounce pointer-events-none">
                <ChevronLeft className="w-5 h-5 rotate-90 mb-1 opacity-50" />
                <span className="text-[10px] font-medium tracking-wider drop-shadow-md">上にスワイプ</span>
              </div>
            </div>

            {/* アプリ一覧画面 (ドロワー) */}
            <div 
              className={`absolute inset-0 bg-white/95 backdrop-blur-xl z-30 transition-all duration-300 flex flex-col ${isDrawerOpen ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'}`}
              onPointerDown={(e) => e.stopPropagation()} // ドロワー内での操作を親に伝播させない
              onTouchStart={(e) => e.stopPropagation()} // タッチ操作も伝播させない
              onMouseDown={(e) => e.stopPropagation()} 
            >
              <div className="h-10 w-full flex justify-center items-center cursor-pointer mt-8" onClick={() => setIsDrawerOpen(false)}>
                <ChevronDown className="w-6 h-6 text-slate-400" />
              </div>
              
              {/* 検索バー */}
              <div className="px-6 pb-4">
                <div className="bg-slate-100 rounded-2xl flex items-center p-2 px-4 border border-slate-200">
                  <Search className="w-4 h-4 text-slate-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="アプリを検索..." 
                    className="bg-transparent outline-none w-full text-sm text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* アイコングリッド */}
              <div className="flex-grow overflow-y-auto px-6 pt-2 pb-20 content-start">
                {filteredApps.length > 0 ? (
                  <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {filteredApps.map((app) => (
                      <div key={app.id} className="flex flex-col items-center group">
                        <button 
                          onClick={() => handleOpenApp(app.id)}
                          className={`w-14 h-14 ${app.id === 'ai' && aiCustomIcon ? '' : app.color} rounded-2xl flex items-center justify-center shadow-sm transform active:scale-90 transition-all duration-200 border border-slate-200/50 overflow-hidden`}
                        >
                          {app.id === 'ai' && aiCustomIcon ? (
                            <img src={aiCustomIcon} alt="AI Custom Icon" className="w-full h-full object-cover" />
                          ) : (
                            <app.icon className="w-7 h-7 text-white" />
                          )}
                        </button>
                        <span className="text-[10px] text-slate-700 mt-2 font-medium truncate w-full text-center">{app.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <p className="text-sm">見つかりませんでした</p>
                  </div>
                )}
              </div>
            </div>

            {/* アプリウィンドウ (個別アプリ起動時) */}
            <div className={`absolute inset-0 bg-white transition-all duration-300 z-40 flex flex-col ${activeApp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
              
              <div className="h-8 bg-transparent pointer-events-none shrink-0"></div>
              
              <div 
                className="flex-grow overflow-hidden relative" 
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {ActiveComponent && (
                  <ActiveComponent 
                    onClose={handleHomeAction} 
                    photos={photos} 
                    setPhotos={setPhotos} 
                    currentWallpaper={wallpaper}
                    setWallpaper={setWallpaper}
                    aiCustomIcon={aiCustomIcon}
                    setAiCustomIcon={setAiCustomIcon}
                    appName={activeAppObj?.name}
                  />
                )}
              </div>
            </div>

          </div>

          {/* ホームインジケーター */}
          <div className="h-6 w-full absolute bottom-0 z-50 flex justify-center items-center cursor-pointer group pb-2" onClick={handleHomeAction}>
             <div className={`w-1/3 h-1 ${isDrawerOpen && !activeApp ? 'bg-black/30 group-hover:bg-black/50' : 'bg-white/50 group-hover:bg-white'} rounded-full transition-colors drop-shadow-md`}></div>
          </div>

        </div>
      </div>
      
    </div>
  );
}