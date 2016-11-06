<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:transform
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        xmlns:ixsl="http://saxonica.com/ns/interactiveXSLT"
        xmlns:js="http://saxonica.com/ns/globalJS"
        xmlns:style="http://saxonica.com/ns/html-property"

        extension-element-prefixes="ixsl"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        version="2.0"
>
<xsl:output method="text"  indent="no"/>

    <xsl:template match="@*|node()">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="body">
        <xsl:copy>
            <xsl:text>[</xsl:text>
            <xsl:apply-templates/>
            <xsl:text>]</xsl:text>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="ol">
        <xsl:for-each select="./li">
            <xsl:text>{</xsl:text>
            <xsl:text>"component": "</xsl:text>
            <xsl:value-of select='@otherprops'/>
            <xsl:text>", "finished": "false",</xsl:text>

            <xsl:for-each select="./p">
                <xsl:choose>
                    <xsl:when test="position() = 1">
                        <xsl:text>"title": "</xsl:text><xsl:value-of select='.'/>"<xsl:text>, "subTitle": "</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select='.'/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>

            <xsl:text>"}</xsl:text>
            <xsl:if test="position() != last()"><xsl:text>,</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

</xsl:transform>

