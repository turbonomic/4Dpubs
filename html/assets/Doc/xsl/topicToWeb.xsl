<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:transform
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"

        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        version="2.0"
>
    <xsl:output method="html"  indent="no"/>

<xsl:param name="topicPath"/>
<xsl:param name="topicNameParam"/>
<xsl:param name="shortFilename"/>
<xsl:param name="dv_vals"/>
<xsl:param name="dv_attr"/>
<xsl:param name="rootHtmlDoc"/>


<!--
    <xsl:template match="@*|node()">
        <xsl:copy>
        <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    -->

    <xsl:template match="topic">
        <xsl:copy>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>




<xsl:template match="*[@conref]">    
	  <xsl:element name="conrefWrapper">
	      <xsl:attribute name="reference"><xsl:value-of select="@conref"/></xsl:attribute>
	  </xsl:element>
</xsl:template>



    <!-- =========== NESTED TOPIC RULES =========== -->

    <!-- NESTED TOPIC TITLES (sensitive to nesting depth, but are still processed for contained markup) -->
    <!-- 1st level - topic/title -->
    <!-- Condensed topic title into single template without priorities; use $headinglevel to set heading.
         If desired, somebody could pass in the value to manually set the heading level -->
    <xsl:template match="topic/title" name="topic_title">
        <xsl:param name="headinglevel">
            <xsl:value-of select="count(ancestor::topic)"/>
        </xsl:param>
        <xsl:choose> <!-- Test for a resource topic in the API docs... -->
            <xsl:when test="../@props='resource'">
                <xsl:element name="h3">
                    <xsl:attribute name="class">topictitle<xsl:value-of select="3"/></xsl:attribute>
                    <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
                    <xsl:element name="input">
                        <xsl:attribute name="type">button</xsl:attribute>
                        <xsl:attribute name="value"><xsl:value-of select="../@otherprops"/></xsl:attribute>
                        <xsl:attribute name="onClick">vmtHelpCustom.showHideApi('<xsl:value-of select="../@otherprops"/>:<xsl:value-of select="../body/codeblock[1]"/>', this)</xsl:attribute>
                    </xsl:element>
                    <xsl:apply-templates/>
                </xsl:element>
            </xsl:when>

            <xsl:otherwise>
                <xsl:element name="h{$headinglevel}">
                    <xsl:attribute name="class">topictitle<xsl:value-of select="$headinglevel"/></xsl:attribute>
                    <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
                    <xsl:apply-templates/>
                </xsl:element>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <!-- TITLE for asection... -->
    <xsl:template match="section/title">
        <xsl:element name="p">
            <xsl:attribute name="class">SectionTitle</xsl:attribute>
            <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>

    <!-- TITLE for an image, in a figgroup... -->
    <xsl:template match="figgroup/title">
        <xsl:element name="p">
            <xsl:attribute name="class">Figure</xsl:attribute>
            <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>


<xsl:template match="shortdesc">
    <xsl:element name="p">
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

    <!-- FOr the body, must decide whether this is a dynamic or static resource
    topic in the API doc.  For dynamic, convert it into a sand box. -->

    <xsl:template match="body" name="topic.body">

        <xsl:choose>
            <xsl:when test="../@props='resource'"> <!-- Body for an API resource topic -->
                <xsl:choose>
                    <xsl:when test="../@outputclass='dynamic'">
                        <xsl:element name="div">
                            <xsl:attribute name="class">api_sandbox</xsl:attribute>
                            <xsl:attribute name="id"><xsl:value-of select="../@otherprops"/>:<xsl:value-of select='./codeblock[1]'/></xsl:attribute>
                            <xsl:attribute name="style">display:none;</xsl:attribute>

                            <xsl:apply-templates/>

                            <xsl:element name="br"/>
                            <xsl:element name="input">
                                <xsl:attribute name="type">button</xsl:attribute>
                                <xsl:attribute name="value">Try It!</xsl:attribute>
                                <xsl:attribute name="onClick">vmtHelpCustom.doUrl('sandboxForm_<xsl:value-of select="ancestor::topic[1]/@id"/>')</xsl:attribute>
                            </xsl:element>
                            <xsl:element name="input">
                                <xsl:attribute name="type">button</xsl:attribute>
                                <xsl:attribute name="value">Clear Result</xsl:attribute>
                                <xsl:attribute name="onClick">vmtHelpCustom.clearUrlResult('sandboxForm_<xsl:value-of select="ancestor::topic[1]/@id"/>')</xsl:attribute>
                            </xsl:element>

                            <xsl:element name="div">
                                <xsl:attribute name="id">urlStr:sandboxForm_<xsl:value-of select="ancestor::topic[1]/@id"/></xsl:attribute>
                            </xsl:element>

                            <xsl:element name="div">
                                <xsl:attribute name="id">apiResult:sandboxForm_<xsl:value-of select="ancestor::topic[1]/@id"/></xsl:attribute>
                                <xsl:attribute name="style">width: 1000px; height: 200px; overflow-y: scroll; overflow-x: scroll;</xsl:attribute>
                                <xsl:attribute name="style">display:none;</xsl:attribute>
                            </xsl:element>

                        </xsl:element>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:element name="div">
                            <xsl:attribute name="class">api_sandbox</xsl:attribute>
                            <xsl:attribute name="id"><xsl:value-of select="../@otherprops"/>:<xsl:value-of select='./codeblock[1]'/></xsl:attribute>
                            <xsl:attribute name="style">display:none;</xsl:attribute>

                            <xsl:apply-templates/>

                        </xsl:element>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>

            <xsl:otherwise> <!-- Just a normal topic body -->
                <div>
                    <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
                    <xsl:apply-templates/>
                </div>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>



    <!-- ============== API DOC STUFF =================== -->
    <!-- Make the dynamic content for resource descriptions in the API doc. -->

    <xsl:template match="topic[@props='resource']">

        <xsl:element name="div">
            <xsl:attribute name="class">apiResource</xsl:attribute>
            <xsl:element name="form">
                <xsl:attribute name="id">sandboxForm_<xsl:value-of select="@id"/></xsl:attribute>
                <xsl:attribute name="class">hidden</xsl:attribute>
                <xsl:attribute name="style">display: block;</xsl:attribute>
                <xsl:element name="input">
                    <xsl:attribute name="type">hidden</xsl:attribute>
                    <xsl:attribute name="name">httpMethod</xsl:attribute>
                    <xsl:attribute name="value"><xsl:value-of select="@otherprops"/></xsl:attribute>
                </xsl:element>
                <xsl:element name="input">
                    <xsl:attribute name="type">hidden</xsl:attribute>
                    <xsl:attribute name="name">methodUri</xsl:attribute>
                    <xsl:attribute name="value"><xsl:value-of select="./body/codeblock[1]"/></xsl:attribute>
                </xsl:element>

                <xsl:apply-templates/>

            </xsl:element>
        </xsl:element>
    </xsl:template>



    <xsl:template match="parml" name="parml">

        <!-- MAKE THE TABLE SHELL -->
        <xsl:choose>
            <xsl:when test="../../@outputclass='dynamic'">
                <table class="parameters">
                    <thead><tr><th>Parameter</th><th>Value</th><th>Type</th><th>Req/Opt</th><th>Description</th></tr></thead>
                    <tbody>
                        <xsl:apply-templates/>
                        <!-- CLOSE THE TABLE SHELL -->
                    </tbody></table>
            </xsl:when>
            <xsl:otherwise>
                <table class="parameters">
                    <thead><tr><th>Parameter</th><th>Type</th><th>Req/Opt</th><th>Description</th></tr></thead>
                    <tbody>
                        <xsl:apply-templates/>
                        <!-- CLOSE THE TABLE SHELL -->
                    </tbody></table>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>



    <xsl:template match="plentry" name="plentry">
        <xsl:element name="tr">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>


    <xsl:template match="pd" name="pd">
        <xsl:element name="td">
            <xsl:attribute name="class">description</xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>


    <xsl:template match="pt" name="pt">
        <xsl:element name="td">
            <xsl:attribute name="class">name</xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>

        <xsl:if test="../../../../@outputclass='dynamic'">
            <xsl:element name="td">
                <xsl:attribute name="class">parameter</xsl:attribute>
                <xsl:element name="input">
                    <xsl:attribute name="name"><xsl:value-of select="."/></xsl:attribute>
                    <xsl:attribute name="class">parameter</xsl:attribute>
                </xsl:element>
            </xsl:element>
        </xsl:if>
    </xsl:template>

    <xsl:template match="example" >
        <xsl:if test="not(../../@outputclass='dynamic')">
            <!--
            <xsl:if test="../../@outputclass='static'">
            <xsl:if test="../../@outputclass[not('static')]">
            -->
            <xsl:element name="br"/>
            <h4>Example:</h4>
            <xsl:apply-templates/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="apiname">
        <p><b><xsl:apply-templates/>:</b></p>
    </xsl:template>

    <!-- ============== END API DOC STUFF =================== -->





    <!-- paragraphs -->
    <xsl:template match="p">
        <!-- To ensure XHTML validity, need to determine whether the DITA kids are block elements.
             If so, use div_class="p" instead of p -->
        <xsl:choose>
            <xsl:when test="descendant::pre or
       descendant::ul or
       descendant::sl or
       descendant::ol or
       descendant::lq or
       descendant::dl or
       descendant::note or
       descendant::lines or
       descendant::fig or
       descendant::table or
       descendant::simpletable">
                <div class="p">
                    <!--
                      <xsl:call-template name="setid"/>
                      <xsl:apply-templates select="." mode="outputContentsWithFlagsAndStyle"/>
                      -->
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:otherwise>
                <p>
                    <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="ancestor::li">
                            <xsl:attribute name="class">Bullet-Continue</xsl:attribute>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:choose>
                        <xsl:when test="ancestor::note and not(preceding-sibling::*)">
                            <xsl:attribute name="class">Note</xsl:attribute>
                            <b>NOTE: </b>
                        </xsl:when>
                    </xsl:choose>
                    <!--
                      <xsl:call-template name="setid"/>
                      <xsl:apply-templates select="." mode="outputContentsWithFlagsAndStyle"/>
                         <xsl:copy-of select="."/>
                      <xsl:value-of select="."/>
                      -->
                    <!--
                       <xsl:apply-templates mode="do_text"/>
                       -->
                    <xsl:apply-templates/>
                </p>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <xsl:template match="note">
        <hr/>
        <xsl:apply-templates/>
        <hr/>
    </xsl:template>



    <xsl:template match="ul">
        <ul>
            <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
            <xsl:apply-templates/>
        </ul>
    </xsl:template>


    <xsl:template match="ol">
        <ol>
            <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
            <xsl:apply-templates/>
        </ol>
    </xsl:template>




    <!-- list item -->
    <xsl:template match="li">
        <xsl:element name="li">
            <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
            <xsl:choose>
                <xsl:when test="ancestor::ul">
                    <xsl:attribute name="class">Bulleted</xsl:attribute>
                </xsl:when>
            </xsl:choose>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>



    <xsl:template match="codeblock">
        <div class = "codeblock">
            <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
            <xsl:element name="pre">
                <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
                <xsl:apply-templates/>
            </xsl:element>
        </div>
    </xsl:template>


    <!-- ======================================== -->
<!-- Tables... -->


    <xsl:template match="table">

        <xsl:call-template name="dotable"/>
        <!-- special case for IE & NS for frame & no rules - needs to be a double table -->
        <!--
        <xsl:variable name="colsep">
          <xsl:choose>
            <xsl:when test="@colsep">
              <xsl:value-of select="@colsep"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>

        <xsl:variable name="rowsep">
          <xsl:choose>
            <xsl:when test="@rowsep">
              <xsl:value-of select="@rowsep"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>
        <xsl:choose>
          <xsl:when test="@frame='all' and $colsep='0' and $rowsep='0'">
            <table cellpadding="4" cellspacing="0" border="1" class="tableborder">
              <tr>
                <td>
                  <xsl:call-template name="dotable"/>
                </td>
              </tr>
            </table>
          </xsl:when>
          <xsl:when test="@frame='top' and $colsep='0' and $rowsep='0'">
            <hr />
            <xsl:call-template name="dotable"/>
          </xsl:when>
          <xsl:when test="@frame='bot' and $colsep='0' and $rowsep='0'">
            <xsl:call-template name="dotable"/>
            <hr />
          </xsl:when>
          <xsl:when test="@frame='topbot' and $colsep='0' and $rowsep='0'">
            <hr />
            <xsl:call-template name="dotable"/>
            <hr />
          </xsl:when>
          <xsl:when test="not(@frame) and $colsep='0' and $rowsep='0'">
            <table cellpadding="4" cellspacing="0" border="1" class="tableborder">
              <tr>
                <td>
                  <xsl:call-template name="dotable"/>
                </td>
              </tr>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <div class="tablenoborder">
              <xsl:call-template name="dotable"/>
            </div>
          </xsl:otherwise>
        </xsl:choose>
        -->
    </xsl:template>


    <xsl:template name="dotable">
        <table cellpadding="4" cellspacing="0" summary="">
            <xsl:variable name="colsep">
                <xsl:choose>
                    <xsl:when test="@colsep"><xsl:value-of select="@colsep"/></xsl:when>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="rowsep">
                <xsl:choose>
                    <xsl:when test="@rowsep"><xsl:value-of select="@rowsep"/></xsl:when>
                </xsl:choose>
            </xsl:variable>
            <!--
            <xsl:call-template name="setid"/>
            -->
            <!--
            <xsl:call-template name="setscale"/>
            -->
            <!-- When a table's width is set to page or column, force it's width to 100%. If it's in a list, use 90%.
                 Otherwise, the table flows to the content -->
            <!--
            <xsl:choose>
             <xsl:when test="(@expanse='page' or @pgwide='1')and (ancestor::*[contains(@class,' topic/li ')] or ancestor::*[contains(@class,' topic/dd ')] )">
              <xsl:attribute name="width">90%</xsl:attribute>
             </xsl:when>
             <xsl:when test="(@expanse='column' or @pgwide='0') and (ancestor::*[contains(@class,' topic/li ')] or ancestor::*[contains(@class,' topic/dd ')] )">
              <xsl:attribute name="width">90%</xsl:attribute>
             </xsl:when>
             <xsl:when test="(@expanse='page' or @pgwide='1')">
              <xsl:attribute name="width">100%</xsl:attribute>
             </xsl:when>
             <xsl:when test="(@expanse='column' or @pgwide='0')">
              <xsl:attribute name="width">100%</xsl:attribute>
             </xsl:when>
            </xsl:choose>
            -->
            <xsl:choose>
                <xsl:when test="@frame='all' and $colsep='0' and $rowsep='0'">
                    <xsl:attribute name="border">0</xsl:attribute>
                </xsl:when>
                <xsl:when test="not(@frame) and $colsep='0' and $rowsep='0'">
                    <xsl:attribute name="border">0</xsl:attribute>
                </xsl:when>
                <xsl:when test="@frame='sides'">
                    <xsl:attribute name="frame">vsides</xsl:attribute>
                    <xsl:attribute name="border">1</xsl:attribute>
                </xsl:when>
                <xsl:when test="@frame='top'">
                    <xsl:attribute name="frame">above</xsl:attribute>
                    <xsl:attribute name="border">1</xsl:attribute>
                </xsl:when>
                <xsl:when test="@frame='bottom'">
                    <xsl:attribute name="frame">below</xsl:attribute>
                    <xsl:attribute name="border">1</xsl:attribute>
                </xsl:when>
                <xsl:when test="@frame='topbot'">
                    <xsl:attribute name="frame">hsides</xsl:attribute>
                    <xsl:attribute name="border">1</xsl:attribute>
                </xsl:when>
                <xsl:when test="@frame='none'">
                    <xsl:attribute name="frame">void</xsl:attribute>
                    <xsl:attribute name="border">1</xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="frame">border</xsl:attribute>
                    <xsl:attribute name="border">1</xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:choose>
                <xsl:when test="@frame='all' and $colsep='0' and $rowsep='0'">
                    <xsl:attribute name="border">0</xsl:attribute>
                </xsl:when>
                <xsl:when test="not(@frame) and $colsep='0' and $rowsep='0'">
                    <xsl:attribute name="border">0</xsl:attribute>
                </xsl:when>
                <xsl:when test="$colsep='0' and $rowsep='0'">
                    <xsl:attribute name="rules">none</xsl:attribute>
                    <xsl:attribute name="border">0</xsl:attribute>
                </xsl:when>
                <xsl:when test="$colsep='0'">
                    <xsl:attribute name="rules">rows</xsl:attribute>
                </xsl:when>
                <xsl:when test="$rowsep='0'">
                    <xsl:attribute name="rules">cols</xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="rules">all</xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <!--
            <xsl:call-template name="place-tbl-lbl"/>
            -->
            <!-- title and desc are processed elsewhere -->
            <xsl:apply-templates select="tgroup"/>
        </table>
        <!--
        <xsl:call-template name="end-flags-and-rev"><xsl:with-param name="flagrules" select="$flagrules"/></xsl:call-template>
        -->
    </xsl:template>



    <xsl:template match="tgroup" name="topic.tgroup">
        <xsl:apply-templates/>
    </xsl:template>




    <xsl:template match="thead" name="topic.thead">
        <thead>
            <xsl:choose>
                <xsl:when test="@align">
                    <xsl:attribute name="align">
                        <xsl:value-of select="@align"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:call-template name="th-align"/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="@char">
                <xsl:attribute name="char">
                    <xsl:value-of select="@char"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@charoff">
                <xsl:attribute name="charoff">
                    <xsl:value-of select="@charoff"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@valign">
                <xsl:attribute name="valign">
                    <xsl:value-of select="@valign"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </thead>
    </xsl:template>


    <xsl:template match="tbody" name="topic.tbody">
        <tbody>
            <xsl:if test="@align">
                <xsl:attribute name="align">
                    <xsl:value-of select="@align"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@char">
                <xsl:attribute name="char">
                    <xsl:value-of select="@char"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@charoff">
                <xsl:attribute name="charoff">
                    <xsl:value-of select="@charoff"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@valign">
                <xsl:attribute name="valign">
                    <xsl:value-of select="@valign"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
            <!-- process table footer -->
        </tbody>
    </xsl:template>


    <xsl:template match="row" name="topic.row">
        <tr>
            <xsl:if test="@align">
                <xsl:attribute name="align">
                    <xsl:value-of select="@align"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@char">
                <xsl:attribute name="char">
                    <xsl:value-of select="@char"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@charoff">
                <xsl:attribute name="charoff">
                    <xsl:value-of select="@charoff"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@valign">
                <xsl:attribute name="valign">
                    <xsl:value-of select="@valign"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </tr>
    </xsl:template>


    <xsl:template match="entry" name="topic.entry">
        <xsl:choose>
            <!--
                <xsl:when test="parent::*/parent::*thead">
                -->
            <xsl:when test="parent::*/parent::thead">
                <xsl:call-template name="topic.thead_entry"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="topic.tbody_entry"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <!-- do header entries -->
    <xsl:template name="topic.thead_entry">
        <th>
            <xsl:variable name="span_size">
                <xsl:call-template name="find-entry-span"/>
            </xsl:variable>
            <xsl:attribute name="colspan"><xsl:value-of select="$span_size"/></xsl:attribute>
            <xsl:call-template name="doentry"/>
        </th>
    </xsl:template>

    <!-- do body entries -->
    <xsl:template name="topic.tbody_entry">
        <!--
          -->
        <td>
            <xsl:variable name="span_size">
                <xsl:call-template name="find-entry-span"/>
            </xsl:variable>
            <xsl:attribute name="colspan"><xsl:value-of select="$span_size"/></xsl:attribute>
            <xsl:call-template name="doentry"/>
        </td>
    </xsl:template>




    <xsl:template name="doentry">
        <xsl:choose>
            <!-- When entry is empty, output a blank -->
            <xsl:when test="not(*|text()|processing-instruction())">
                <xsl:text>&#160;</xsl:text>  <!-- nbsp -->
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>






    <xsl:template name="find-entry-span">

        <xsl:variable name="startpos">
            <xsl:call-template name="find-entry-start-position"/>
        </xsl:variable>
        <xsl:variable name="endpos">
            <xsl:call-template name="find-entry-end-position"/>
        </xsl:variable>
        <xsl:value-of select="($endpos - $startpos) + 1"/>
        <!--
        <xsl:when test="$startpos &lt; $endpos">
            <xsl:value-of select="($endpos - $startpos) + 1"/>
        </xsl:when>
        <otherwise><xsl:value-of select="1"/></otherwise>
        -->
        <!-- If endpos is > startpos, get the diff plus one... -->


    </xsl:template>




    <!-- Find the starting column of an entry in a row. -->
    <xsl:template name="find-entry-start-position">
        <xsl:choose>

            <!-- if the column number is specified, use it -->
            <xsl:when test="@colnum">
                <xsl:value-of select="@colnum"/>
            </xsl:when>

            <!-- If there is a defined column name, check the colspans to determine position -->
            <xsl:when test="@colname">
                <!-- count the number of colspans before the one this entry references, plus one -->
                <!--
                <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=current()/@colname]/preceding-sibling::*)+1)"/>
                -->
                <xsl:value-of select="number(count(../../../colspec[@colname=current()/@colname]/preceding-sibling::*)+1)"/>
            </xsl:when>

            <!-- If the starting column is defined, check colspans to determine position -->
            <xsl:when test="@namest">
                <!--
                  <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=current()/@namest]/preceding-sibling::*)+1)"/>
                  -->
                <xsl:value-of select="number(count(../../../colspec[@colname=current()/@namest]/preceding-sibling::*)+1)"/>
            </xsl:when>

            <!-- Need a test for spanspec -->
            <xsl:when test="@spanname">
                <xsl:variable name="startspan">  <!-- starting column for this span -->
                    <!--
                      <xsl:value-of select="../../../*[contains(@class,' topic/spanspec ')][@spanname=current()/@spanname]/@namest"/>
                      -->
                    <xsl:value-of select="../../../spanspec[@spanname=current()/@spanname]/@namest"/>
                </xsl:variable>
                <!--
                <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=$startspan]/preceding-sibling::*)+1)"/>
                -->
                <xsl:value-of select="number(count(../../../colspec[@colname=$startspan]/preceding-sibling::*)+1)"/>
            </xsl:when>

            <!-- Otherwise, just use the count of cells in this row -->
            <xsl:otherwise>
                <xsl:variable name="prev-sib">
                    <xsl:value-of select="count(preceding-sibling::*)"/>
                </xsl:variable>
                <xsl:value-of select="$prev-sib+1"/>
            </xsl:otherwise>

        </xsl:choose>
    </xsl:template>

    <!-- Find the end column of a cell. If the cell does not span any columns,
         the end position is the same as the start position. -->
    <xsl:template name="find-entry-end-position">
        <xsl:param name="startposition" select="0"/>
        <xsl:choose>
            <xsl:when test="@nameend">
                <!--
                  <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=current()/@nameend]/preceding-sibling::*)+1)"/>
                  -->
                <xsl:value-of select="number(count(../../../colspec[@colname=current()/@nameend]/preceding-sibling::*)+1)"/>
            </xsl:when>
            <xsl:when test="@spanname">
                <xsl:variable name="endspan">  <!-- starting column for this span -->
                    <!--
                      <xsl:value-of select="../../../*[contains(@class,' topic/spanspec ')][@spanname=current()/@spanname]/@nameend"/>
                      -->
                    <xsl:value-of select="../../../spanspec[@spanname=current()/@spanname]/@nameend"/>
                </xsl:variable>
                <!--
                <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=$endspan]/preceding-sibling::*)+1)"/>
                -->
                <xsl:value-of select="number(count(../../../colspec[@colname=$endspan]/preceding-sibling::*)+1)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$startposition"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>




    <!-- For simple table headers: <TH> Set align="right" when in a BIDI area -->
    <xsl:template name="th-align">
        <xsl:attribute name="align">left</xsl:attribute>
    </xsl:template>



    <!-- ======================================== -->
    <!-- Text Ranges... -->


    <xsl:template match="b">
        <xsl:element name="b">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="i">
        <xsl:element name="i">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="codeph">
        <xsl:element name="code">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>



    <!-- ================================================== -->
    <!-- Images and other objects... -->

    <xsl:template match="xref">
        <xsl:variable name="outputclassStr" select="@outputclass"/>
        <xsl:variable name="hrefStr" select="@href"/>
        <xsl:variable name="externalFunctionStr">
            <xsl:value-of select="$rootHtmlDoc" />#topic=<xsl:value-of select="$topicNameParam"/><xsl:value-of select="@href"/>
        </xsl:variable>
        <xsl:variable name="internalFunctionStr">
            <xsl:value-of select="$rootHtmlDoc" />#topic=<xsl:value-of select="$topicNameParam"/><xsl:value-of select="$shortFilename"/>&amp;hash=<xsl:value-of select="translate(@href, '\#', '')"/>
        </xsl:variable>

        <xsl:element name="a">
            <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
            <xsl:choose>
                <xsl:when test="@outputclass = 'InternalUrl'">
                    <xsl:attribute name="href"><xsl:value-of select="@href"/></xsl:attribute>
                </xsl:when>
                <xsl:when test="@outputclass = 'ExternalUrl'">
                    <xsl:attribute name="href"><xsl:value-of select="@href"/></xsl:attribute>
                    <xsl:attribute name="target">_blank</xsl:attribute>
                </xsl:when>
                <xsl:when test="@scope = 'external'">
                    <xsl:attribute name="href"><xsl:value-of select="@href"/></xsl:attribute>
                    <xsl:attribute name="target">_blank</xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <xsl:when test="contains($hrefStr, 'xml')">
                            <xsl:attribute name="href"><xsl:value-of select="$externalFunctionStr"/></xsl:attribute>
                            <xsl:attribute name="rootHtmlDoc"><xsl:value-of select="$rootHtmlDoc"/></xsl:attribute>
                            <xsl:attribute name="topicNameParam"><xsl:value-of select="$topicNameParam"/></xsl:attribute>
                            <xsl:attribute name="shortFilename"><xsl:value-of select="$shortFilename"/></xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="href"><xsl:value-of select="$internalFunctionStr"/></xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>




    <xsl:template match="image">
        <xsl:variable name="temp"><xsl:value-of select="@href"/></xsl:variable>
        <xsl:element name="img">
            <xsl:attribute name="alt">image</xsl:attribute>
            <xsl:attribute name="height"><xsl:value-of select="@height"/></xsl:attribute>
            <xsl:attribute name="width"><xsl:value-of select="@width"/></xsl:attribute>
            <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
            <xsl:choose> <!-- Handle refs to graphics from the SVN dir struct, compared to refs from the client HTML shell file -->
                <xsl:when test="starts-with($temp,'../')">
                    <xsl:attribute name="src">assets/Doc/<xsl:value-of select="substring-after($temp, '../')"/></xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="src">assets/Doc/<xsl:value-of select="$temp"/></xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
    </xsl:template>




    <!-- First CHOOSE deletes the given condition. OTHERWISE gets any text out. -->
    <!--
-->
<xsl:template match="text()">
  <xsl:choose>
	  <xsl:when test="((preceding-sibling::processing-instruction()[1]) and (starts-with(preceding-sibling::processing-instruction('Fm')[1], 'Condstart')))">
		  <xsl:variable name="condName">
		  	<xsl:value-of select="normalize-space(substring-after(preceding-sibling::processing-instruction('Fm')[1], 'Condstart'))" />
		  </xsl:variable>
		  <xsl:if test="$condName != 'Deleted' and $condName != 'PrintOnly' and $condName != 'Hidden' "><xsl:value-of select="." /></xsl:if>
	  </xsl:when>
	  <xsl:otherwise>
	  	<xsl:value-of select="." />
	  </xsl:otherwise>
  </xsl:choose>
</xsl:template>








</xsl:transform>