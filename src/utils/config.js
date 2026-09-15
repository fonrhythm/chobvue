// src/utils/config.js

// 地区配置
export const REGIONS = {
  THAILAND: 'thailand',
  CHINA: 'china',
  OVERSEA: 'oversea',
  CHOB: 'chob'
}

// 泰国配色
export const COLORS_TH = {
  bg: '#faf9f7',
  surface: '#fff',
  border: '#e6e2dc',
  borderSoft: '#f1eee8',
  text: '#1a1a1a',
  sub: '#666',
  muted: '#8a8a8a',
  
  // 类别颜色
  bl: '#142b4b',      // 蓝色
  glBg: '#d7ccba',    // 金色背景
  gl: '#7a5c3a',      // 金色文字
  bandBg: '#2b4779',
  singerBg: '#c4b59c',
  groupBg: '#6e8dbb',
  actorBg: '#d0c5af',
  otherBg: '#9db1ca'
}

// 中国配色
export const COLORS_CN = {
  bg: '#faf9f7',
  surface: '#fff',
  border: '#e6e2dc',
  borderSoft: '#f1eee8',
  text: '#1a1a1a',
  sub: '#666',
  muted: '#8a8a8a',
  
  bl: '#533A33',
  glBg: '#C96D8A',
  gl: '#C96D8A',
  actorBg: '#F9D4DA',
  musicBg: '#B5ACA3',
  otherBg: '#F5E6D1'
}

// 海外配色
export const COLORS_OVS = {
  bg: '#faf9f7',
  surface: '#fff',
  border: '#e6e2dc',
  borderSoft: '#f1eee8',
  text: '#1a1a1a',
  sub: '#666',
  muted: '#8a8a8a',
  
  bl: '#442D1C',
  glBg: '#743014',
  gl: '#743014',
  bandBg: '#464336',
  singerBg: '#674b3f',
  groupBg: '#907C6C',
  actorBg: '#C9BEAD',
  otherBg: '#a27d60'
}

// 获取对应地区的颜色
export function getRegionColors(region) {
  switch(region) {
    case REGIONS.THAILAND: return COLORS_TH
    case REGIONS.CHINA: return COLORS_CN
    case REGIONS.OVERSEA: return COLORS_OVS
    default: return COLORS_TH
  }
}

// 获取艺人类别颜色
export function getArtistColor(category, region, isOfficial) {
  const colors = getRegionColors(region)
  
  let bgColor = colors.otherBg
  let textColor = '#fff'
  
  if (region === REGIONS.THAILAND) {
    switch(category?.toLowerCase()) {
      case 'band': bgColor = colors.bandBg; break
      case 'singer': bgColor = colors.singerBg; break
      case 'group': bgColor = colors.groupBg; break
      case 'actor': bgColor = colors.actorBg; break
      case 'bl': bgColor = colors.bl; break
      case 'gl': bgColor = colors.glBg; textColor = colors.gl; break
      default: bgColor = colors.otherBg
    }
  } else if (region === REGIONS.CHINA) {
    switch(category?.toLowerCase()) {
      case 'actor': bgColor = colors.actorBg; textColor = '#674b3f'; break
      case 'music': bgColor = colors.musicBg; break
      case 'gl': bgColor = colors.glBg; break
      case 'bl': bgColor = colors.bl; break
      default: bgColor = colors.otherBg; textColor = '#674b3f'
    }
  } else if (region === REGIONS.OVERSEA) {
    switch(category?.toLowerCase()) {
      case 'band': bgColor = colors.bandBg; break
      case 'singer': bgColor = colors.singerBg; break
      case 'group': bgColor = colors.groupBg; break
      case 'actor': bgColor = colors.actorBg; textColor = '#3a2a1e'; break
      case 'bl': bgColor = colors.bl; break
      case 'gl': bgColor = colors.glBg; break
      default: bgColor = colors.otherBg
    }
  }
  
  return {
    background: isOfficial ? 'transparent' : bgColor,
    color: isOfficial ? bgColor : textColor,
    border: isOfficial ? `1.5px solid ${bgColor}` : 'none'
  }
}