import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
	return (
		<div className="global-page-enter w-full min-h-full">
			{children}
		</div>
	);
}
