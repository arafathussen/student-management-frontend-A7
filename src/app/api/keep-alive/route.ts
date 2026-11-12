import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://riseabroad-server.vercel.app/api/v1";

interface PingCheck {
	endpoint: string;
	ok: boolean;
	status: number;
	latencyMs: number;
	records?: number;
	error?: string;
}

async function runKeepAliveCheck(source: string) {
	const startedAt = Date.now();
	const checks: PingCheck[] = [];

	const endpoints = [
		"/higher-study/countries",
		"/higher-study/universities?limit=1",
	];

	for (const endpoint of endpoints) {
		const targetUrl = `${API_BASE_URL.replace(/\/+$/, "")}${endpoint}`;
		const epStart = Date.now();
		try {
			const res = await fetch(targetUrl, {
				method: "GET",
				cache: "no-store",
				headers: {
					Accept: "application/json",
					"x-keep-alive-source": source,
				},
			});

			let records: number | undefined;
			try {
				const json = await res.json();
				const list = json?.data?.data || json?.data || json;
				if (Array.isArray(list)) {
					records = list.length;
				}
			} catch {
				// Non-JSON response ignored
			}

			checks.push({
				endpoint,
				ok: res.ok,
				status: res.status,
				latencyMs: Date.now() - epStart,
				records,
			});
		} catch (err: any) {
			checks.push({
				endpoint,
				ok: false,
				status: 500,
				latencyMs: Date.now() - epStart,
				error: err?.message || "Network timeout / unreachable",
			});
		}
	}

	const allOk = checks.every((c) => c.ok);
	const totalLatencyMs = Date.now() - startedAt;

	return NextResponse.json(
		{
			success: allOk,
			status: allOk ? "ONLINE" : "DEGRADED",
			database: "Supabase PostgreSQL (via Prisma API)",
			apiBaseUrl: API_BASE_URL,
			triggerSource: source,
			scheduleUtc: "0 0 * * * (Daily 6:00 AM Bangladesh Time / BST)",
			checkedAt: new Date().toISOString(),
			latencyMs: totalLatencyMs,
			checks,
		},
		{
			status: allOk ? 200 : 502,
			headers: {
				"Cache-Control": "no-store, max-age=0",
			},
		}
	);
}

export async function GET(req: NextRequest) {
	const isVercelCron = Boolean(req.headers.get("x-vercel-cron"));
	const source = isVercelCron ? "vercel-cron-6am" : "manual-get";
	return runKeepAliveCheck(source);
}

export async function POST() {
	return runKeepAliveCheck("super-admin-manual-ping");
}
