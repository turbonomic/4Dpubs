<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" encoding="iso-8859-1" indent="yes"/>

<xsl:template match="/"><xsl:apply-templates select="*"/></xsl:template>

<!-- Turn map into string of records (sep by '|') and fields (sep  by '+') -->
<!-- TO DO: Pass parameters for rec and field separators... -->
<xsl:template match="map">
BOGUS<!-- To start off the array... -->
<xsl:apply-templates select="*"/>
</xsl:template>



<!-- Determine which is a chapter, and which is a chapt child -->
<xsl:template match="topicref">
  <xsl:variable name="ancestor_href">
    <xsl:value-of select="ancestor::topicref[1]/@href"/>
  </xsl:variable>
  <xsl:variable name="title">
    <xsl:apply-templates select="." mode="get-navtitle"/>
  </xsl:variable>
  <xsl:choose>
    <xsl:when test="$title and $title!=''">
        <xsl:choose>
          <xsl:when test="ancestor::topicref">        
        	<xsl:apply-templates select="." mode="is_child">
        		<xsl:with-param name="ancestor_href"><xsl:value-of select="$ancestor_href"/></xsl:with-param>
        	</xsl:apply-templates>
            <xsl:apply-templates select="topicref">
            </xsl:apply-templates>
          </xsl:when>
          <xsl:otherwise>        
        	<xsl:apply-templates select="." mode="is_chapter">
        		<xsl:with-param name="ancestor_href"><xsl:value-of select="$ancestor_href"/></xsl:with-param>
        	</xsl:apply-templates>
            <xsl:apply-templates select="topicref">
            </xsl:apply-templates>
          </xsl:otherwise>
        </xsl:choose>
    </xsl:when>
  </xsl:choose>
</xsl:template>
<!-- Build chapts and childrent -->
<xsl:template match="*" mode="is_child">
<xsl:param name="ancestor_href"/>
|<xsl:value-of select="@href"/>+<xsl:value-of select="$ancestor_href"/>+<xsl:value-of select="@navtitle"/>
</xsl:template>

<xsl:template match="*" mode="is_chapter">
<xsl:param name="ancestor_href"/>
|<xsl:value-of select="@href"/>+root+<xsl:value-of select="@navtitle"/>
</xsl:template>

<!-- Deprecating the named template in favor of the mode template. -->
<xsl:template name="navtitle">
  <xsl:apply-templates select="." mode="get-navtitle"/>
</xsl:template>
<xsl:template match="*" mode="get-navtitle">
	<xsl:value-of select="@navtitle"/>
</xsl:template>

<xsl:template match="text()"/>

</xsl:stylesheet>