export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Animated Logo Pulse */}
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-primary font-bold animate-pulse">جاري التحميل...</p>
            </div>
        </div>
    )
}
