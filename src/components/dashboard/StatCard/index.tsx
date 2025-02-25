import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion } from 'framer-motion'
import { JSX } from "react"

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.3,
            ease: "easeOut"
        }
    })
}

export const StatCard = ({
    title,
    value,
    description,
    icon,
    change,
    index,
    loading = false
}: {
    title: string
    value: string | number
    description: string
    icon: JSX.Element
    change?: number
    index: number
    loading?: boolean
}) => (
    <motion.div
        custom={index}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
    >
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-24 mb-1" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}

                {change !== undefined && (
                    <div className="flex items-center mt-1">
                        {change >= 0 ? (
                            <div className="text-sm flex items-center text-green-600 dark:text-green-400">
                                <ChevronUp size={16} className="mr-1" />
                                {change.toFixed(1)}%
                            </div>
                        ) : (
                            <div className="text-sm flex items-center text-red-600 dark:text-red-400">
                                <ChevronDown size={16} className="mr-1" />
                                {Math.abs(change).toFixed(1)}%
                            </div>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">from last week</span>
                    </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    </motion.div>
)