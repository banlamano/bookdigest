#!/bin/bash
# Cron job to keep Render backend alive
# Add to crontab: */10 * * * * /path/to/cron-keep-alive.sh

curl -s https://bookdigest-lypx.onrender.com/health > /dev/null
echo "Pinged backend at $(date)"
