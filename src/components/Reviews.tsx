import React from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';

const reviews = [
    { id: 1, user: "Ahmed Al-Balushi", rating: 5, comment: "Fast services, got the code in less than a minute! Pricing is excellent compared to the Omani market.", date: "Jan 5, 2026", verified: true },
    { id: 2, user: "Sara Al-Ajmi", rating: 4, comment: "Game works perfectly on my PS5. Thanks CLIC7 for the reliability.", date: "Jan 7, 2026", verified: true },
    { id: 3, user: "Jasim Mohammed", rating: 5, comment: "Hands down the best store. The new checkout flow is so smooth.", date: "Jan 19, 2026", verified: true }
];

export default function Reviews() {
    return (
        <div className="mt-24 max-w-4xl mx-auto" dir="ltr">
            <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-3">
                <MessageSquare className="text-primary" /> Customer Reviews
            </h3>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-[#121214] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors relative group">
                        {review.verified && (
                            <div className="absolute top-8 right-8 flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full">
                                <CheckCircle size={14} /> Verified Purchase
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center font-bold text-lg text-white">
                                {review.user.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-white text-lg">{review.user}</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-sm">• {review.date}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed pl-16">"{review.comment}"</p>
                    </div>
                ))}
            </div>

            {/* Add Review Form */}
            <div className="mt-12 bg-gradient-to-b from-white/5 to-transparent p-1 rounded-3xl">
                <div className="bg-[#0A0A0A] p-8 rounded-[22px]">
                    <h4 className="text-xl font-bold text-white mb-6">Write a Review</h4>
                    <textarea
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-all resize-none h-32"
                        placeholder="Share your experience..."
                    />
                    <div className="flex justify-end mt-4">
                        <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
                            Post Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
