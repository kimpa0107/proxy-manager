#!/bin/bash

# 获取当前活跃的网络服务名称
get_current_service() {
    local currentservice=""
    while read -r line; do
        sname=$(echo "$line" | awk -F "(, )|(: )|[)]" '{print $2}')
        sdev=$(echo "$line" | awk -F "(, )|(: )|[)]" '{print $4}')

        if [ -n "$sdev" ]; then
            ifout="$(ifconfig "$sdev" 2>/dev/null)"
            echo "$ifout" | grep 'status: active' > /dev/null 2>&1
            rc="$?"
            if [ "$rc" -eq 0 ]; then
                currentservice="$sname"
                break
            fi
        fi
    done <<< "$(networksetup -listnetworkserviceorder 2>/dev/null | grep 'Hardware Port')"

    if [ -z "$currentservice" ]; then
        # 默认使用 Wi-Fi
        currentservice="Wi-Fi"
    fi

    echo "$currentservice"
}

# 开启代理
turn_on_proxy() {
    local host="$1"
    local port="$2"
    local http_enabled="${3:-true}"
    local socks_enabled="${4:-true}"

    if [ -z "$host" ] || [ -z "$port" ]; then
        >&2 echo "Host and port are required"
        exit 1
    fi

    local service=$(get_current_service)

    echo "Setting proxy for service: $service"
    echo "Host: $host, Port: $port"
    echo "HTTP/HTTPS: $http_enabled, SOCKS: $socks_enabled"

    if [ "$http_enabled" = "true" ]; then
        # 设置 HTTP 代理
        networksetup -setwebproxy "$service" "$host" "$port" 2>/dev/null
        # 设置 HTTPS 代理
        networksetup -setsecurewebproxy "$service" "$host" "$port" 2>/dev/null
        # 开启代理状态
        networksetup -setwebproxystate "$service" on 2>/dev/null
        networksetup -setsecurewebproxystate "$service" on 2>/dev/null
        echo "HTTP/HTTPS proxy enabled"
    fi

    if [ "$socks_enabled" = "true" ]; then
        # 设置 SOCKS 代理
        networksetup -setsocksfirewallproxy "$service" "$host" "$port" 2>/dev/null
        # 开启 SOCKS 代理状态
        networksetup -setsocksfirewallproxystate "$service" on 2>/dev/null
        echo "SOCKS proxy enabled"
    fi

    echo "Proxy enabled successfully"
}

# 关闭代理
turn_off_proxy() {
    local service=$(get_current_service)

    echo "Turning off proxy for service: $service"

    # 关闭所有代理状态
    networksetup -setwebproxystate "$service" off 2>/dev/null
    networksetup -setsecurewebproxystate "$service" off 2>/dev/null
    networksetup -setsocksfirewallproxystate "$service" off 2>/dev/null

    echo "All proxies disabled successfully"
}

# 获取代理状态 - 使用 scutil
get_proxy_status() {
    local http_enable=$(scutil --proxy 2>/dev/null | grep 'HTTPEnable :' | awk '{print $3}')
    local https_enable=$(scutil --proxy 2>/dev/null | grep 'HTTPSEnable :' | awk '{print $3}')
    local socks_enable=$(scutil --proxy 2>/dev/null | grep 'SOCKSEnable :' | awk '{print $3}')
    
    if [[ "$http_enable" == "1" ]] || [[ "$https_enable" == "1" ]] || [[ "$socks_enable" == "1" ]]; then
        echo "on"
    else
        echo "off"
    fi
}

# 获取当前代理配置 - 使用 scutil
get_proxy_config() {
    local proxy_info=$(scutil --proxy 2>/dev/null)
    
    # 从 scutil 输出中提取信息
    local http_server=$(echo "$proxy_info" | grep 'HTTPProxy :' | awk '{print $3}')
    local http_port=$(echo "$proxy_info" | grep 'HTTPPort :' | awk '{print $3}')
    local http_enable=$(echo "$proxy_info" | grep 'HTTPEnable :' | awk '{print $3}')
    local https_enable=$(echo "$proxy_info" | grep 'HTTPSEnable :' | awk '{print $3}')
    local socks_enable=$(echo "$proxy_info" | grep 'SOCKSEnable :' | awk '{print $3}')
    
    # 判断代理类型是否启用
    local http_enabled="false"
    local socks_enabled="false"
    
    if [[ "$http_enable" == "1" ]] || [[ "$https_enable" == "1" ]]; then
        http_enabled="true"
    fi
    
    if [[ "$socks_enable" == "1" ]]; then
        socks_enabled="true"
    fi
    
    echo "{\"host\":\"${http_server:-}\",\"port\":\"${http_port:-}\",\"httpEnabled\":\"$http_enabled\",\"socksEnabled\":\"$socks_enabled\"}"
}

# 主函数 - 根据参数执行不同操作
case "$1" in
    "on")
        turn_on_proxy "$2" "$3" "$4" "$5"
        ;;
    "off")
        turn_off_proxy
        ;;
    "status")
        get_proxy_status
        ;;
    "config")
        get_proxy_config
        ;;
    *)
        echo "Usage: $0 {on|off|status|config} [host] [port] [http_enabled] [socks_enabled]"
        exit 1
        ;;
esac
