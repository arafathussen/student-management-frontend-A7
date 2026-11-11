import { Badge } from "@/components/ui/Badge";
import type { Role } from "@/types";
import { Award, GraduationCap, Shield, UserCheck } from "lucide-react";
import React from "react";

export const RoleBadge: React.FC<{
	role?: Role | string;
	className?: string;
}> = ({ role, className }) => {
	switch (role) {
		case "SUPER_ADMIN":
			return (
				<Badge variant="gold" className={className}>
					<Shield className="w-3 h-3 text-yellow-400" />
					<span>SUPER ADMIN</span>
				</Badge>
			);
		case "ADMIN":
			return (
				<Badge variant="purple" className={className}>
					<Award className="w-3 h-3 text-purple-400" />
					<span>ADMIN</span>
				</Badge>
			);
		case "COUNSELOR":
			return (
				<Badge variant="default" className={className}>
					<UserCheck className="w-3 h-3 text-blue-400" />
					<span>COUNSELOR</span>
				</Badge>
			);
		case "STUDENT":
			return (
				<Badge variant="success" className={className}>
					<GraduationCap className="w-3 h-3 text-emerald-400" />
					<span>STUDENT</span>
				</Badge>
			);
		default:
			return <Badge className={className}>{role || "USER"}</Badge>;
	}
};
