import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageCircle, Share2, Sparkles, Plus, 
  Globe, Video, X
} from 'lucide-react';
import { CommunityPost } from '../../types';
import { createPost, subscribeToPosts, likePost } from '../../services/socialService';
import { useProfileStore } from '../../services/profileService';
import HolographicPanel from '../profile/HolographicPanel';
import clsx from 'clsx';

interface CommunityFeedProps {
  onConnect?: (userId: string) => void;
}

const CommunityFeed = ({ onConnect }: CommunityFeedProps) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState('all');
  const { config } = useProfileStore();

  useEffect(() => {
    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (title: string, content: string, type: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!config) return;
    
    await createPost({
      userId: config.userId,
      username: config.username,
      title,
      content,
      type: type as any,
      mediaUrl,
      mediaType,
      likes: 0,
      comments: 0,
      tags: [],
      astralContext: {
        posterResonance: config.astrology?.resonanceLevel || 1
      }
    });
    setIsCreating(false);
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 pb-24">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-purple-400" />
            Astral Community
          </h2>
          <p className="text-white/40 text-sm">Syncing consciousness with fellow travelers...</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
            {['all', 'astrology_insight', 'ritual_share', 'question'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-purple-600 text-white" : "text-white/40 hover:text-white"
                )}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsCreating(true)}
            className="p-3 rounded-full bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreating && (
          <PostCreator 
            onClose={() => setIsCreating(false)} 
            onSubmit={handleCreatePost}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} onConnect={onConnect} />
        ))}
      </div>
    </div>
  );
};

const PostCreator = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (title: string, content: string, type: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('astrology_insight');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const isVideo = file.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');
      // In a real app, this would be a URL from Firebase Storage
      // For demo, we'll use a placeholder URL and flag the type
      const demoUrl = URL.createObjectURL(file);
      setMediaUrl(demoUrl);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Channel Your Insight
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {['astrology_insight', 'ritual_share', 'question', 'reflection'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                  type === t ? "bg-purple-600 border-purple-400 text-white shadow-lg" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Insight Title..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share the wisdom flowing through you..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 h-48 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
          />

          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group">
              <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              {isUploading ? (
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Uploading...</span>
                </div>
              ) : (
                <>
                  <Video className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-purple-400 transition-colors">Attach Media</span>
                </>
              )}
            </label>
            {mediaUrl && (
              <div className="relative w-16 h-16 rounded-xl border border-white/10 overflow-hidden">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaUrl} className="w-full h-full object-cover" />
                )}
                <button 
                  onClick={() => setMediaUrl('')}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onSubmit(title, content, type, mediaUrl || undefined, mediaType)}
            disabled={!title || !content || isUploading}
            className="w-full bg-white text-black font-bold uppercase tracking-widest text-sm py-5 rounded-2xl hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Broadcast to Universe
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PostCard = ({ post, onConnect }: { post: CommunityPost, onConnect?: (userId: string) => void }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    await likePost(post.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <HolographicPanel 
        title={post.title} 
        icon={<Sparkles className="w-4 h-4 text-purple-400" />}
        className="group"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-purple-400">
                {post.username[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white/90">@{post.username}</p>
                  {onConnect && (
                    <button 
                      onClick={() => onConnect(post.userId)}
                      className="p-1 rounded-lg hover:bg-white/10 text-purple-400 transition-colors"
                      title="Connect with this soul"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-white/30 uppercase tracking-widest leading-none">
                    Resonance Level {post.astralContext?.posterResonance || 1}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold tracking-widest text-white/40">
              {post.type.replace('_', ' ')}
            </div>
          </div>

          <p className="text-white/80 leading-relaxed mb-6 whitespace-pre-wrap">
            {post.content}
          </p>

          {post.mediaUrl && (
            <div className="mb-8 rounded-3xl overflow-hidden border border-white/10 bg-black/40 aspect-video relative group/media">
              {post.mediaType === 'video' ? (
                <video 
                  src={post.mediaUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1200"
                />
              ) : (
                <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                className={clsx(
                  "flex items-center gap-2 transition-all",
                  isLiked ? "text-rose-500" : "text-white/30 hover:text-white"
                )}
              >
                <Heart className={clsx("w-5 h-5", isLiked && "fill-current")} />
                <span className="text-xs font-bold">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              
              <button className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-bold">{post.comments}</span>
              </button>
            </div>

            <button className="text-white/30 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </HolographicPanel>
    </motion.div>
  );
};

export default CommunityFeed;
