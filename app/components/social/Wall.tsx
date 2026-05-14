import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, Video, X, Sparkles } from 'lucide-react';
import { WallPost, UserProfileConfig } from '../../types';
import { createWallPost, subscribeToWallPosts } from '../../services/socialService';
import { useProfileStore } from '../../services/profileService';
import clsx from 'clsx';
import HolographicPanel from '../profile/HolographicPanel';

export const Wall = ({ profileId, readOnly = false }: { profileId: string; readOnly?: boolean }) => {
  const [posts, setPosts] = useState<WallPost[]>([]);
  const { config } = useProfileStore();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    const unsubscribe = subscribeToWallPosts(profileId, (newPosts) => {
      setPosts(newPosts);
    });
    return () => unsubscribe();
  }, [profileId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const isVideo = file.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');
      const demoUrl = URL.createObjectURL(file);
      setMediaUrl(demoUrl);
      setIsUploading(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!content && !mediaUrl) return;
    if (!config) return;
    
    await createWallPost(profileId, {
      fromUserId: config.userId,
      fromUsername: config.username,
      content,
      mediaUrl: mediaUrl || undefined,
      mediaType,
    });
    
    setContent('');
    setMediaUrl('');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-light text-white tracking-widest uppercase flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-fuchsia-400" />
        Cosmic Wall
      </h3>

      {!readOnly && (
        <HolographicPanel className="p-4 bg-white/5 border border-white/10 rounded-2xl relative">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-fuchsia-400 shrink-0">
              {config?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Leave a message on this soul's wall..."
                className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-white/30 resize-none flex-1 text-sm min-h-[60px]"
              />
              
              {mediaUrl && (
                <div className="relative w-32 h-32 rounded-xl border border-white/10 overflow-hidden mt-3 group">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaUrl} className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => setMediaUrl('')}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <label className={clsx("p-2 rounded-full cursor-pointer transition-colors", isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 text-white/40 hover:text-fuchsia-400")}>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={isUploading} />
                  {isUploading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={(!content && !mediaUrl) || isUploading}
                  className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </HolographicPanel>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {posts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-fuchsia-400 text-xs shrink-0">
                  {post.fromUsername?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">@{post.fromUsername}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap pl-11">
                {post.content}
              </p>

              {post.mediaUrl && (
                <div className="ml-11 rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video relative">
                  {post.mediaType === 'video' ? (
                    <video 
                      src={post.mediaUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={post.mediaUrl} alt="Wall media" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
