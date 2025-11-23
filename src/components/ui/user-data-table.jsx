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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// --- PROPS INTERFACE ---
// UserDataTableProps:
// - users: Array of user objects
// - visibleColumns: Set of column keys to display
// - onEdit: Optional callback function (user) => void
// - onDelete: Optional callback function (user) => void

// --- STATUS BADGE VARIANTS ---
const badgeVariants = cva("capitalize text-white", {
  variants: {
    variant: {
      active: "bg-green-500 hover:bg-green-600",
      inactive: "bg-gray-500 hover:bg-gray-600",
      disabled: "bg-red-500 hover:bg-red-600",
    },
  },
  defaultVariants: {
    variant: "active",
  },
})

// --- MAIN COMPONENT ---
export const UserDataTable = ({ 
  users = [], 
  visibleColumns = new Set(),
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
    { key: "username", label: "用户名" },
    { key: "email", label: "邮箱" },
    { key: "name", label: "姓名" },
    { key: "roles", label: "角色" },
    { key: "createdAt", label: "创建时间" },
    { key: "status", label: "状态" },
    { key: "actions", label: "操作" },
  ]

  const getUserStatus = (user) => {
    if (user.status) {
      return user.status
    }
    if (user.deleted_at) {
      return { text: "已禁用", variant: "disabled" }
    }
    return { text: "活跃", variant: "active" }
  }

  const getInitials = (user) => {
    if (user.username) {
      return user.username.charAt(0).toUpperCase()
    }
    if (user.name) {
      return user.name.charAt(0).toUpperCase()
    }
    return "U"
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
            {users.length > 0 ? (
              users.map((user, index) => {
                const status = getUserStatus(user)
                
                return (
                  <motion.tr
                    key={user.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {visibleColumns.has("username") && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback>{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            {user.nickname && (
                              <div className="text-xs text-muted-foreground">{user.nickname}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.has("email") && (
                      <TableCell>{user.email || "-"}</TableCell>
                    )}

                    {visibleColumns.has("name") && (
                      <TableCell>{user.name || "-"}</TableCell>
                    )}

                    {visibleColumns.has("roles") && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns.has("createdAt") && (
                      <TableCell>
                        {(user.createdAt || user.created_at)
                          ? new Date(user.createdAt || user.created_at).toLocaleDateString('zh-CN', {
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
                          {onEdit && (
                            <button
                              onClick={() => onEdit(user)}
                              className="text-primary-600 hover:text-primary-900 text-sm"
                            >
                              编辑
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(user)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              删除
                            </button>
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

