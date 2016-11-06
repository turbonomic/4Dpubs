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
    <xsl:output method="html"  indent="no"/>



    <xsl:template match="@*|node()">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="shortdesc">
        <xsl:copy>
        <xsl:value-of select="." />
        <xsl:apply-templates/>
    </xsl:copy>
</xsl:template>


</xsl:transform>