export function SpreadBooksLogo() {
    return (
        <div className="flex size-20 items-center justify-center rounded-xl bg-white shadow-lg">
            <svg
                viewBox="0 0 60 60"
                className="size-12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="8"
                    y="12"
                    width="44"
                    height="36"
                    rx="4"
                    stroke="#00477D"
                    strokeWidth="3"
                    fill="none"
                />
                <path
                    d="M14 20h32v4H14zM14 28h28v4H14zM14 36h20v4H14z"
                    fill="#00477D"
                    opacity="0.15"
                />
                <text
                    x="30"
                    y="38"
                    textAnchor="middle"
                    fill="#00477D"
                    fontSize="24"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                >
                    S
                </text>
            </svg>
        </div>
    );
}
