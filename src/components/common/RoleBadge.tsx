import { Badge } from "@/components/ui/Badge";
import type { Role } from "@/types";
import { Award, GraduationCap, Shield, UserCheck } from "lucide-react";
import React from "react";

export const RoleBadge: React.FC<{
	role?: Role | string;
	className?: string;
}> = ({ role, className }) => {
	const baseClass = `whitespace-nowrap shrink-0 text-[10px] px-2 py-0.5 gap-1 font-semibold ${className || ""}`;
	switch (role) {
		case "SUPER_ADMIN":
			return (
				<Badge variant="gold" className={baseClass}>
					<Shield className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
					<span>SUPER ADMIN</span>
				</Badge>
			);
		case "ADMIN":
			return (
				<Badge variant="purple" className={baseClass}>
					<Award className="w-2.5 h-2.5 text-purple-400 shrink-0" />
					<span>ADMIN</span>
				</Badge>
			);
		case "COUNSELOR":
			return (
				<Badge variant="default" className={baseClass}>
					<UserCheck className="w-2.5 h-2.5 text-blue-400 shrink-0" />
					<span>COUNSELOR</span>
				</Badge>
			);
		case "STUDENT":
			return (
				<Badge variant="success" className={baseClass}>
					<GraduationCap className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
					<span>STUDENT</span>
				</Badge>
			);
		default:
			return <Badge className={baseClass}>{role || "USER"}</Badge>;
	}
};
