import React, { useState, useEffect } from 'react';
import { Star, Send, X, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── StarRating sub-component ── */
const StarRating = ({ value, onChange, readOnly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s} type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-all ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`${sz} transition-colors ${
              s <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

/* ── ReviewModal ── */
export const ReviewModal = ({ expoId, expoTitle, onClose, onSubmitted }) => {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);

  const submit = async () => {
    if (!rating) return toast.error('Please select a star rating');
    setSaving(true);
    try {
      await api.post('/reviews', { expoId, rating, comment });
      toast.success('Review submitted! Thank you 🙏');
      onSubmitted?.();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-white">Rate Your Experience</h2>
            <p className="text-xs text-slate-400 mt-0.5">{expoTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="input-label">Overall Rating *</label>
            <div className="mt-2">
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-slate-500 mt-1">
                {['','Poor','Fair','Good','Very Good','Excellent'][rating] || 'Tap to rate'}
              </p>
            </div>
          </div>
          <div>
            <label className="input-label">Your Review (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4} maxLength={500}
              placeholder="Share what you loved, what could be improved, highlights..."
              className="input resize-none"
            />
            <p className="text-xs text-slate-600 text-right mt-1">{comment.length}/500</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={submit} disabled={saving || !rating} className="btn-primary flex-1 justify-center">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── ReviewList (read-only display) ── */
export const ReviewList = ({ expoId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    api.get(`/reviews/${expoId}`)
      .then(r => {
        setReviews(r.data.data);
        if (r.data.data.length) {
          setAvg(r.data.data.reduce((s, r) => s + r.rating, 0) / r.data.data.length);
        }
      })
      .finally(() => setLoading(false));
  }, [expoId]);

  if (loading) return <div className="py-4 flex justify-center"><div className="w-6 h-6 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-amber-900/10 rounded-xl border border-amber-800/30">
          <div className="text-3xl font-bold text-white">{avg.toFixed(1)}</div>
          <div>
            <StarRating value={Math.round(avg)} readOnly size="sm" />
            <p className="text-xs text-slate-400 mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {reviews.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No reviews yet. Be the first!</p>
        ) : reviews.map(r => (
          <div key={r._id} className="p-3 bg-dark-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center text-xs font-bold">
                  {r.user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-white text-sm">{r.user?.name}</span>
              </div>
              <StarRating value={r.rating} readOnly size="sm" />
            </div>
            {r.comment && <p className="text-slate-400 text-xs leading-relaxed">{r.comment}</p>}
            <p className="text-slate-600 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { StarRating };
export default ReviewModal;
