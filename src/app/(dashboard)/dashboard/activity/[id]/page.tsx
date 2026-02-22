import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActivityWithFeedback } from "@/lib/services/activity.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Clock, Zap, HeartPulse, Mountain, ArrowLeft, Activity as ActivityIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ActivityMap } from "@/components/dashboard/ActivityMap";
import { ActivityCharts } from "@/components/dashboard/ActivityCharts";

export default async function ActivityPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }

    const activity = await getActivityWithFeedback(params.id, session.user.id);

    if (!activity) {
        notFound();
    }

    // Extract polyline
    const rawPayload = activity.rawPayload as any;
    const polylineString = rawPayload?.map?.summary_polyline || rawPayload?.map?.polyline;

    // Format metrics
    const distanceKm = activity.distanceMeters ? (parseFloat(activity.distanceMeters) / 1000).toFixed(2) : "0.00";
    const durationMins = activity.movingTimeSeconds ? Math.round(activity.movingTimeSeconds / 60) : 0;
    const pace = activity.movingTimeSeconds && activity.distanceMeters
        ? `${Math.floor((activity.movingTimeSeconds / 60) / (parseFloat(activity.distanceMeters) / 1000))}:${Math.round(((activity.movingTimeSeconds / 60) / (parseFloat(activity.distanceMeters) / 1000) % 1) * 60).toString().padStart(2, '0')}`
        : "0:00";

    const elevation = activity.totalElevationGain ? parseFloat(activity.totalElevationGain).toFixed(0) : "0";

    const date = activity.startDate ? format(new Date(activity.startDate), "EEEE, d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : "";

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{activity.name}</h2>
                    <p className="text-muted-foreground capitalize">{date}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Distância</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{distanceKm} km</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo (Movimento)</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{durationMins} min</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ritmo Médio</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pace} /km</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Elevação</CardTitle>
                        <Mountain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{elevation} m</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Visualizations */}
                <Card className="col-span-4 flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg">Percurso GPS</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative z-0 min-h-[400px]">
                        <ActivityMap polyline={polylineString} />
                    </CardContent>
                </Card>

                {/* AI Feedback */}
                <Card className="col-span-3 h-full overflow-hidden flex flex-col bg-primary/5 border-primary/20">
                    <CardHeader className="pb-4 relative z-10 border-b border-primary/10">
                        <div className="absolute top-2 right-4 opacity-10 pointer-events-none">
                            <ActivityIcon size={80} />
                        </div>
                        <CardTitle className="text-lg font-bold flex items-center text-primary">
                            <Zap className="mr-2 h-5 w-5" /> AI Coach Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 text-sm space-y-4 relative z-10">
                        {activity.feedback ? (
                            <>
                                <p className="font-medium text-base mb-2">{activity.feedback.summary}</p>
                                <p className="leading-relaxed whitespace-pre-line">{activity.feedback.content as string}</p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center h-full opacity-70">
                                <p>Este treino ainda não foi analisado pelo AI Coach.</p>
                                <p className="text-xs mt-2 text-muted-foreground">(Análises são geradas logo após a sincronização do Strava)</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Performance Charts */}
            {activity.streamsPayload ? (
                <div className="grid gap-4 md:grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Métricas de Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ActivityCharts streams={activity.streamsPayload as any[]} />
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
