import { NextRequest, NextResponse } from "next/server";

interface PresenceRecord {
	online: boolean;
	agentId?: string;
	agentName?: string;
	agentImage?: string;
	agentRole?: string;
	updatedAt: number;
}

const PRESENCE_TTL_MS = 12000;
const presenceStore = new Map<string, PresenceRecord>();

export async function GET(req: NextRequest) {
	const studentUserId = req.nextUrl.searchParams.get("studentUserId")?.trim();
	if (!studentUserId) {
		return NextResponse.json({ online: false });
	}

	const record = presenceStore.get(studentUserId);
	if (!record || !record.online || Date.now() - record.updatedAt > PRESENCE_TTL_MS) {
		if (record && Date.now() - record.updatedAt > PRESENCE_TTL_MS) {
			presenceStore.delete(studentUserId);
		}
		return NextResponse.json({ online: false });
	}

	return NextResponse.json(record);
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const studentUserId = typeof body?.studentUserId === "string" ? body.studentUserId.trim() : "";
		if (!studentUserId) {
			return NextResponse.json({ success: false }, { status: 400 });
		}

		if (!body.online) {
			presenceStore.delete(studentUserId);
			return NextResponse.json({ success: true, online: false });
		}

		const record: PresenceRecord = {
			online: true,
			agentId: typeof body.agentId === "string" ? body.agentId : undefined,
			agentName: typeof body.agentName === "string" ? body.agentName : undefined,
			agentImage: typeof body.agentImage === "string" ? body.agentImage : undefined,
			agentRole: typeof body.agentRole === "string" ? body.agentRole : undefined,
			updatedAt: Date.now(),
		};

		presenceStore.set(studentUserId, record);
		return NextResponse.json({ success: true, ...record });
	} catch {
		return NextResponse.json({ success: false }, { status: 400 });
	}
}

