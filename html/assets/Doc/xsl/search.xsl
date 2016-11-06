<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text"  indent="no"/>

    <xsl:strip-space elements="*"/>
    <xsl:param name="dv_vals"/>
    <xsl:param name="dv_attr"/>


    <xsl:template match="/"><xsl:apply-templates  select="*"/></xsl:template>
    <xsl:template match="searchRoot">{"searchData": [<xsl:for-each select="searchRecord">{ "file" : "<xsl:value-of select="@file"/>", "name" : "<xsl:value-of select="@name"/>",<xsl:apply-templates/> }<xsl:choose><xsl:when test="position() != last()">,</xsl:when></xsl:choose></xsl:for-each> ]}</xsl:template>
    <xsl:template match="title"> "title": {<xsl:apply-templates/>},</xsl:template>
    <xsl:template match="body"> "body": {<xsl:apply-templates/>},</xsl:template>
    <xsl:template match="keywords"> "keywords": {<xsl:apply-templates/>}</xsl:template>
    <xsl:template match="content"><xsl:for-each select="w">"<xsl:value-of select="./@w"/>":"<xsl:value-of select="./@c"/>"<xsl:choose><xsl:when test="position() != last()">,</xsl:when></xsl:choose></xsl:for-each><xsl:if test="position() != last()">,</xsl:if></xsl:template>
</xsl:stylesheet>

