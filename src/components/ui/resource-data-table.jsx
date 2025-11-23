import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, Database, Router, Network, Container } from "lucide-react"

// --- PROPS INTERFACE ---
// ResourceDataTableProps:
// - resources: Array of resource objects
// - visibleColumns: Set of column keys to display
// - onView: Optional callback function (resource) => void
// - onEdit: Optional callback function (resource) => void
// - onDelete: Optional callback function (resource) => void

// --- STATUS BADGE VARIANTS ---
const badgeVariants = cva("capitalize", {
  variants: {
    variant: {
      enabled: "bg-gray-900 text-white hover:bg-gray-800",
      disabled: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    },
  },
})

// --- ICON MAPPING ---
const typeIcons = {
  linux: Server,
  windows: Server,
  docker: Container,
  database: Database,
  router: Router,
  switch: Network,
}

const typeLabels = {
  linux: "Linux",
  windows: "Windows",
  docker: "Docker",
  database: "数据库",
  router: "路由器",
  switch: "交换机",
}

// --- MAIN COMPONENT ---
export const ResourceDataTable = ({
  resources = [],
  visibleColumns = new Set(),
  onView,
  onEdit,
  onDelete,
}) => {
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeInOut",
      },
    }),
  }

  const tableHeaders = [
    { key: "type", label: "类型" },
    { key: "name", label: "名称" },
    { key: "host", label: "地址" },
    { key: "port", label: "端口" },
    { key: "description", label: "描述" },
    { key: "createdAt", label: "创建时间" },
    { key: "status", label: "状态" },
    { key: "actions", label: "操作" },
  ]

  const getResourceName = (resource) => {
    return resource.hostname || resource.database_nick || resource.router_name || resource.switch_name || resource.name || resource.id || "-"
  }

  const getResourceHost = (resource) => {
    return resource.ipv4_priv || resource.ipv4_pub || resource.host || resource.address || "-"
  }

  const getResourcePort = (resource) => {
    return resource.port || resource.web_port || "-"
  }

  const getResourceStatus = (resource) => {
    // 根据 deleted_at 判断是否启用
    const isEnabled = !resource.deleted_at
    return {
      text: isEnabled ? "启用" : "未启用",
      variant: isEnabled ? "enabled" : "disabled"
    }
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders
                .filter((header) => visibleColumns.has(header.key))
                .map((header) => (
                  <TableHead key={header.key}>{header.label}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length > 0 ? (
              resources.map((resource, index) => {
                const Icon = typeIcons[resource.type] || Server
                const status = getResourceStatus(resource)

                return (
                  <motion.tr
                    key={resource.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {visibleColumns.has("type") && (
                      <TableCell>
                        <Badge variant="outline" className="w-fit">
                          [{resource.type || 'unknown'}]
                        </Badge>
                      </TableCell>
                    )}

                    {visibleColumns.has("name") && (
                      <TableCell className="font-medium">
                        {getResourceName(resource)}
                      </TableCell>
                    )}

                    {visibleColumns.has("host") && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-xs">{getResourceHost(resource)}</span>
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.has("port") && (
                      <TableCell>{getResourcePort(resource)}</TableCell>
                    )}

                    {visibleColumns.has("description") && (
                      <TableCell className="max-w-xs truncate">
                        {resource.description || "-"}
                      </TableCell>
                    )}

                    {visibleColumns.has("createdAt") && (
                      <TableCell>
                        {(resource.createdAt || resource.created_at)
                          ? new Date(resource.createdAt || resource.created_at).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : "-"}
                      </TableCell>
                    )}

                    {visibleColumns.has("status") && (
                      <TableCell>
                        <Badge className={cn(badgeVariants({ variant: status.variant }))}>
                          {status.text}
                        </Badge>
                      </TableCell>
                    )}

                    {visibleColumns.has("actions") && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {onView && (
                            <Button
                              onClick={() => onView(resource)}
                              variant="outline"
                              size="sm"
                            >
                              查看详情
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              onClick={() => onEdit(resource)}
                              variant="outline"
                              size="sm"
                            >
                              编辑
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              onClick={() => onDelete(resource)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              删除
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.size} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

