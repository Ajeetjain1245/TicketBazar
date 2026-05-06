import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Tag,
  Ticket,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Users,
  Armchair,
  FileText,
  IndianRupee,
  LocateFixed,
} from 'lucide-react';
import { ticketsAPI } from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';

const STEPS = [
  { id: 1, title: 'Event Details', icon: Calendar },
  { id: 2, title: 'Ticket Info', icon: Ticket },
  { id: 3, title: 'Pricing & Upload', icon: IndianRupee },
];

const TICKET_TYPES = [
  { value: 'event', label: 'Event', icon: '🎪' },
  { value: 'movie', label: 'Movie', icon: '🎬' },
  { value: 'concert', label: 'Concert', icon: '🎵' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '🎫' },
];

const CATEGORIES = [
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'travel', label: 'Travel' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const SEAT_CLASSES = [
  { value: '', label: 'No specific class' },
  { value: 'general', label: 'General' },
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' },
  { value: 'vip', label: 'VIP' },
  { value: 'premium', label: 'Premium' },
];

const CreateTicket = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [seatNumbers, setSeatNumbers] = useState(['']);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const addr = data.address || {};
          const locationName = [
            addr.amenity || addr.building || addr.road || '',
            addr.suburb || addr.neighbourhood || '',
            addr.city || addr.town || addr.village || '',
            addr.state || '',
          ].filter(Boolean).join(', ');
          updateField('venue', locationName || data.display_name || `${latitude}, ${longitude}`);
          toast.success('Location detected!');
        } catch (err) {
          console.error(err);
          toast.error('Could not fetch address from coordinates');
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied. Please allow location in browser settings.');
        } else {
          toast.error('Could not get your location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [formData, setFormData] = useState({
    // Step 1 - Event Details
    title: '',
    type: 'event',
    eventDate: '',
    eventTime: '',
    venue: '',
    // Step 2 - Ticket Info
    quantity: 1,
    seatNumber: '',
    seatClass: '',
    category: 'entertainment',
    description: '',
    // Step 3 - Pricing
    originalPrice: '',
    resalePrice: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  // Auto-sync seat mapping with quantity
  useEffect(() => {
    setSeatNumbers(prev => {
      const targetLength = formData.quantity;
      if (prev.length === targetLength) return prev;
      if (prev.length < targetLength) {
        return [...prev, ...Array(targetLength - prev.length).fill('')];
      }
      return prev.slice(0, targetLength);
    });
  }, [formData.quantity]);

  // ── Handlers ──
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = useCallback((files) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      toast.error('Please upload image files only');
      return;
    }

    setFormData((prev) => {
      const totalImages = prev.images.length + validFiles.length;
      if (totalImages > 5) {
        toast.error('Maximum 5 images allowed');
        return prev;
      }
      return { ...prev, images: [...prev.images, ...validFiles] };
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, { file, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Step navigation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Event name is required');
          return false;
        }
        if (!formData.eventDate) {
          toast.error('Event date is required');
          return false;
        }
        // check if in the past (only date part)
        const selectedDate = new Date(formData.eventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          toast.error('Event date must be in the future');
          return false;
        }
        return true;
      case 2:
        if (!formData.description.trim()) {
          toast.error('Description is required');
          return false;
        }
        if (formData.quantity < 1) {
          toast.error('Quantity must be at least 1');
          return false;
        }
        return true;
      case 3:
        if (
          !formData.originalPrice ||
          parseFloat(formData.originalPrice) <= 0
        ) {
          toast.error('Original price is required');
          return false;
        }
        if (!formData.resalePrice || parseFloat(formData.resalePrice) <= 0) {
          toast.error('Selling price is required');
          return false;
        }
        if (formData.images.length === 0) {
          toast.error('At least one ticket proof image is required');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setSlideDirection('right');
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const goPrev = () => {
    setSlideDirection('left');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      await ticketsAPI.create({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        resalePrice: parseFloat(formData.resalePrice) || 0,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : new Date().toISOString(),
        eventTime: formData.eventTime,
        venue: formData.venue,
        seatNumber: seatNumbers.filter(s => s.trim() !== '').join(', '),
        seatClass: formData.seatClass,
        quantity: parseInt(formData.quantity),
        images: formData.images,
      });
      toast.success('Ticket listed successfully! Pending verification.');
      navigate('/dashboard/tickets');
    } catch (err) {
      // error toast is handled by the API interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Computed Values ──
  const profitLoss =
    formData.originalPrice && formData.resalePrice
      ? parseFloat(formData.resalePrice) - parseFloat(formData.originalPrice)
      : null;

  const profitLossPercent =
    profitLoss !== null && parseFloat(formData.originalPrice) > 0
      ? ((profitLoss / parseFloat(formData.originalPrice)) * 100).toFixed(1)
      : null;

  const selectedType = TICKET_TYPES.find((t) => t.value === formData.type);

  // ── Render Helpers ──

  const renderProgressBar = () => (
    <div className="sell-progress-bar">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="sell-progress-step">
            <div className="flex items-center">
              <div
                className={`sell-progress-circle ${
                  isCompleted
                    ? 'sell-progress-circle--done'
                    : isActive
                    ? 'sell-progress-circle--active'
                    : 'sell-progress-circle--pending'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`sell-progress-line ${
                    isCompleted ? 'sell-progress-line--done' : ''
                  }`}
                />
              )}
            </div>
            <span
              className={`sell-progress-label ${
                isActive || isCompleted ? 'text-white' : 'text-slate-500'
              }`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="sell-step-content">
      <div className="sell-step-header">
        <Calendar className="w-6 h-6 sell-accent-text" />
        <div>
          <h3 className="text-lg font-bold text-white">Event Details</h3>
          <p className="text-sm text-slate-400">
            Tell us about the event or trip
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Event Name */}
        <div>
          <label className="sell-label">
            Event / Trip Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="sell-input"
            placeholder="e.g. Coldplay Mumbai Concert"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Ticket Type */}
        <div>
          <label className="sell-label">Ticket Type</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TICKET_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => updateField('type', t.value)}
                className={`sell-type-chip ${
                  formData.type === t.value
                    ? 'sell-type-chip--active'
                    : 'sell-type-chip--idle'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="sell-label">
              Event Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              className="sell-input"
              value={formData.eventDate}
              onChange={(e) => updateField('eventDate', e.target.value)}
            />
          </div>
          <div>
            <label className="sell-label">Event Time</label>
            <input
              type="time"
              className="sell-input"
              value={formData.eventTime}
              onChange={(e) => updateField('eventTime', e.target.value)}
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="sell-label">Venue / Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              className="sell-input pl-10 pr-28"
              placeholder="e.g. DY Patil Stadium, Mumbai"
              value={formData.venue}
              onChange={(e) => updateField('venue', e.target.value)}
            />
            <button
              type="button"
              onClick={fetchCurrentLocation}
              disabled={isFetchingLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} />
              {isFetchingLocation ? 'Detecting...' : 'Auto-Detect'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Click Auto-Detect or type venue manually</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="sell-step-content">
      <div className="sell-step-header">
        <Ticket className="w-6 h-6 sell-accent-text" />
        <div>
          <h3 className="text-lg font-bold text-white">Ticket Information</h3>
          <p className="text-sm text-slate-400">
            Details about your tickets
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Quantity & Seat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="sell-label">
              Quantity <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="sell-qty-btn"
                onClick={() =>
                  updateField(
                    'quantity',
                    Math.max(1, formData.quantity - 1)
                  )
                }
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-10 text-center">
                {formData.quantity}
              </span>
              <button
                type="button"
                className="sell-qty-btn"
                onClick={() =>
                  updateField(
                    'quantity',
                    Math.min(10, formData.quantity + 1)
                  )
                }
              >
                <ChevronRight className="w-4 h-4 rotate-0" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="sell-label">Seat Number{formData.quantity > 1 ? 's' : ''}</label>
            <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {seatNumbers.map((seat, index) => (
                <div key={index} className="relative">
                  <Armchair className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    className="sell-input pl-10 bg-slate-800"
                    placeholder={formData.quantity > 1 ? `Seat ${index + 1}` : 'e.g. A12'}
                    value={seat}
                    onChange={(e) => {
                      const newSeats = [...seatNumbers];
                      newSeats[index] = e.target.value;
                      setSeatNumbers(newSeats);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category & Seat Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="sell-label">Category</label>
            <select
              className="sell-input"
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sell-label">Seat Class</label>
            <select
              className="sell-input"
              value={formData.seatClass}
              onChange={(e) => updateField('seatClass', e.target.value)}
            >
              {SEAT_CLASSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="sell-label">
            Description <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <textarea
              className="sell-input pl-10 min-h-[100px] resize-none"
              placeholder="Describe your ticket — what's included, any restrictions, transfer method..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              maxLength={1000}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">
            {formData.description.length}/1000
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="sell-step-content">
      <div className="sell-step-header">
        <IndianRupee className="w-6 h-6 sell-accent-text" />
        <div>
          <h3 className="text-lg font-bold text-white">
            Pricing & Ticket Proof
          </h3>
          <p className="text-sm text-slate-400">
            Set your price and upload proof
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="sell-label">
              Original Price (₹) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="0"
                className="sell-input pl-10"
                placeholder="0"
                value={formData.originalPrice}
                onChange={(e) => updateField('originalPrice', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="sell-label">
              Selling Price (₹) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="0"
                className="sell-input pl-10"
                placeholder="0"
                value={formData.resalePrice}
                onChange={(e) => updateField('resalePrice', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Profit / Loss Indicator */}
        {profitLoss !== null && (
          <div
            className={`sell-profit-strip ${
              profitLoss > 0
                ? 'sell-profit-strip--gain'
                : profitLoss < 0
                ? 'sell-profit-strip--loss'
                : 'sell-profit-strip--even'
            }`}
          >
            {profitLoss > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : profitLoss < 0 ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
            <span className="font-semibold">
              {profitLoss > 0
                ? `Profit: ${formatCurrency(profitLoss)}`
                : profitLoss < 0
                ? `Loss: ${formatCurrency(Math.abs(profitLoss))}`
                : 'Break Even'}
            </span>
            {profitLossPercent !== null && profitLoss !== 0 && (
              <span className="text-sm opacity-80">
                ({profitLoss > 0 ? '+' : ''}
                {profitLossPercent}%)
              </span>
            )}
          </div>
        )}

        {/* Drag & Drop Upload */}
        <div>
          <label className="sell-label">
            Ticket Proof (Images)
          </label>
          <div
            className={`sell-dropzone ${
              isDragging ? 'sell-dropzone--active' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Upload className="w-8 h-8 sell-accent-text mb-2" />
            <p className="text-sm text-slate-300 font-medium">
              Drag & drop images here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              or click to browse · max 5 images · JPG, PNG
            </p>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="sell-thumb">
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="sell-thumb-remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Live Preview Card ──
  const renderPreview = () => (
    <div className="sell-preview-card">
      <div className="sell-preview-header">
        <Sparkles className="w-4 h-4 sell-accent-text" />
        <span className="text-sm font-semibold text-slate-300">
          Live Preview
        </span>
      </div>

      {/* Preview Card Body */}
      <div className="sell-preview-body">
        {/* Image area */}
        <div className="sell-preview-image">
          {imagePreviews.length > 0 ? (
            <img
              src={imagePreviews[0].url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800/60">
              <ImageIcon className="w-10 h-10 text-slate-600" />
            </div>
          )}
          {selectedType && (
            <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium text-slate-300 border border-slate-700">
              {selectedType.icon} {selectedType.label}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <h4 className="font-bold text-white text-sm leading-tight truncate">
            {formData.title || 'Your Event Name'}
          </h4>

          {(formData.eventDate || formData.venue) && (
            <div className="space-y-1.5">
              {formData.eventDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3 h-3 sell-accent-text" />
                  {new Date(formData.eventDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {formData.eventTime && (
                    <>
                      <Clock className="w-3 h-3 sell-accent-text ml-2" />
                      {formData.eventTime}
                    </>
                  )}
                </div>
              )}
              {formData.venue && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3 h-3 sell-accent-text" />
                  <span className="truncate">{formData.venue}</span>
                </div>
              )}
            </div>
          )}

          {formData.quantity > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3 h-3 sell-accent-text" />
              {formData.quantity} tickets
            </div>
          )}

          {/* Price Section */}
          <div className="sell-preview-perforation" />
          <div className="flex items-end justify-between">
            <div>
              {formData.resalePrice && (
                <p className="text-lg font-bold sell-accent-text">
                  {formatCurrency(parseFloat(formData.resalePrice))}
                </p>
              )}
              {formData.originalPrice &&
                formData.resalePrice &&
                parseFloat(formData.originalPrice) !==
                  parseFloat(formData.resalePrice) && (
                  <p className="text-xs text-slate-500 line-through">
                    {formatCurrency(parseFloat(formData.originalPrice))}
                  </p>
                )}
              {!formData.resalePrice && (
                <p className="text-sm text-slate-500 italic">Set price →</p>
              )}
            </div>
            {seatNumbers.some(s => s.trim() !== '') && (
              <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 max-w-[140px] truncate">
                Seat(s) {seatNumbers.filter(s => s.trim() !== '').join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main Render ──
  return (
    <div className="sell-page">
      {/* Page Header */}
      <div className="sell-page-header border-b border-slate-800 pb-8 mb-12">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 font-display uppercase tracking-tighter">
            Sell Your Ticket
          </h1>
          <p className="text-slate-500 mt-2 text-base font-medium">
            Join the elite marketplace. Fast, secure, and transparent.
          </p>
        </div>
        <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 hidden sm:block">
           <Tag className="w-10 h-10 text-indigo-500" />
        </div>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Main Content */}
      <div className="sell-layout">
        {/* Form Column */}
        <div className="sell-form-col">
          <div className="sell-card">
            {/* Step Content */}
            <div
              key={currentStep}
              className={`sell-slide sell-slide--${slideDirection}`}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Navigation */}
            <div className="sell-nav flex items-center justify-between mt-12 bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="px-6 py-3 rounded-2xl font-bold font-display text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-8 py-3 rounded-2xl font-bold font-display bg-indigo-500 text-slate-950 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-3xl font-black font-display uppercase tracking-widest bg-indigo-500 text-slate-950 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      Listing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      List My Ticket
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="sell-preview-col">{renderPreview()}</div>
      </div>
    </div>
  );
};

export default CreateTicket;
