package vip.xiaonuo.zj.modular.listing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import vip.xiaonuo.common.pojo.CommonEntity;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@TableName("ZJ_LISTING")
@Schema(description = "租迹房源")
public class ZjListing extends CommonEntity {
    @TableId
    private String id;
    private String publisherId;
    private String title;
    private String city;
    private String district;
    private String community;
    private Long monthlyRentCents;
    private LocalDate availableFrom;
    private LocalDate leaseEndsAt;
    private String description;
    private String status;
    private String reviewRemark;
    private Integer exposureScore;

    @TableField(exist = false)
    private List<String> imageUrls;
}
