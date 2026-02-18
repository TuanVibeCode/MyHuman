
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/MomentsView.tsx
 * 功能描述：仿微信朋友圈信息流组件。
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { useAI } from '../context/AIContext';
import { Moment } from '../types';
import { formatWeChatTime } from '../utils/helpers';

interface MomentsViewProps {
  filterAuthor?: string; // 如果提供，则只显示该用户的朋友圈
  onBack?: () => void;
}

const MomentsView: React.FC<MomentsViewProps> = ({ filterAuthor, onBack }) => {
  const { moments } = useAI();
  
  const displayedMoments = filterAuthor 
      ? moments.filter(m => m.authorName.includes(filterAuthor))
      : moments;

  return (
    <div className="h-full bg-white overflow-y-auto relative scrollbar-hide font-sans">
        {/* Cover Photo Area */}
        <div className="relative mb-16">
            <div className="h-64 bg-gray-800 w-full overflow-hidden relative">
                 <img 
                    src={filterAuthor ? "https://picsum.photos/id/111/500/300" : "https://picsum.photos/id/193/500/300"} 
                    className="w-full h-full object-cover opacity-80" 
                    alt="Cover"
                 />
                 {onBack && (
                     <button onClick={onBack} className="absolute top-10 left-4 text-white p-2 z-50 drop-shadow-md">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                 )}
            </div>
            
            {/* User Info (Overlay) */}
            <div className="absolute -bottom-8 right-4 flex items-end gap-3 z-10">
                <span className="text-white font-bold text-lg mb-4 drop-shadow-md shadow-black">
                    {filterAuthor || "The Boss"}
                </span>
                <img 
                    src={filterAuthor ? "https://picsum.photos/id/64/100/100" : "https://picsum.photos/id/64/50/50"} 
                    className="w-16 h-16 rounded-[8px] border-2 border-white object-cover bg-white" 
                    alt="Avatar"
                />
            </div>
        </div>

        {/* Moments Feed */}
        <div className="px-4 pb-20 space-y-8 pt-4">
            {displayedMoments.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">Nothing here yet...</div>
            ) : (
                displayedMoments.map((moment) => (
                    <div key={moment.id} className="flex gap-3">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <img 
                                src={moment.avatar || "https://picsum.photos/id/20/100/100"} 
                                className="w-10 h-10 rounded-[4px] bg-gray-200 object-cover" 
                                alt={moment.authorName}
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4 border-b border-gray-100">
                            <h4 className="text-[#5b6a92] font-bold text-[15px] leading-tight mb-1">
                                {moment.authorName}
                            </h4>
                            <p className="text-[15px] text-gray-900 leading-normal mb-2 whitespace-pre-wrap">
                                {moment.content}
                            </p>
                            
                            {/* Images Grid */}
                            {moment.images && moment.images.length > 0 && (
                                <div className={`grid gap-1 mb-2 ${moment.images.length === 1 ? 'grid-cols-1 max-w-[200px]' : moment.images.length === 4 ? 'grid-cols-2 max-w-[200px]' : 'grid-cols-3'}`}>
                                    {moment.images.map((img, idx) => (
                                        <div key={idx} className={`aspect-square bg-gray-100 overflow-hidden ${moment.images.length === 1 ? 'aspect-auto max-h-[200px]' : ''}`}>
                                            <img src={img} className="w-full h-full object-cover" alt="Moment" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-[12px]">
                                    {formatWeChatTime(moment.timestamp)}
                                </span>
                                <button className="bg-[#f7f7f7] text-[#5b6a92] px-2 rounded text-lg leading-none pb-1 hover:bg-gray-200">
                                    ··
                                </button>
                            </div>

                            {/* Likes & Comments Bubble */}
                            {(moment.likes.length > 0 || moment.comments.length > 0) && (
                                <div className="bg-[#f7f7f7] rounded-[4px] p-2 text-[13px]">
                                    {moment.likes.length > 0 && (
                                        <div className="flex items-start gap-1.5 text-[#5b6a92] mb-1">
                                            <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                            <span className="font-semibold leading-tight">
                                                {moment.likes.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {moment.comments.map((comment, i) => (
                                        <div key={i} className="leading-5">
                                            <span className="text-[#5b6a92] font-semibold">{comment.author}: </span>
                                            <span className="text-gray-800">{comment.content}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default MomentsView;
